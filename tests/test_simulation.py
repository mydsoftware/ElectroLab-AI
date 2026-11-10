import pytest
from backend.app.services.simulation import parse_operating_point, validate_netlist

VALID = """مدار آزمایشی
V1 in 0 DC 5
R1 in 0 1k
.op
.end
"""

def test_accepts_basic_dc_operating_point_netlist():
    result = validate_netlist(VALID)
    assert "V1 in 0 DC 5" in result
    assert result.endswith(".end\n")

@pytest.mark.parametrize("directive", [
    ".control\nquit\n.end",
    '.include "/etc/passwd"\n.op\n.end',
    ".tran 1u 1m\n.op\n.end",
    ".shell whoami\n.op\n.end",
])
def test_rejects_unsupported_directives(directive):
    with pytest.raises(ValueError):
        validate_netlist(directive)

def test_requires_operating_point_and_end():
    with pytest.raises(ValueError):
        validate_netlist("مدار\nR1 a 0 1k\n.end")

def test_rejects_invalid_element_values():
    with pytest.raises(ValueError):
        validate_netlist("مدار\nR1 a 0 python\n.op\n.end")

def test_parse_ngspice_operating_point_values():
    output = """Operating Point
Node Voltage
------------
in 5.000000e+00
out 2.500000e+00
Voltage source currents
-----------------------
v1#branch -2.500000e-03
"""
    nodes, currents = parse_operating_point(output)
    assert nodes == {"in": 5.0, "out": 2.5}
    assert currents == {"v1#branch": -0.0025}


def test_parse_operating_point_returns_empty_for_unavailable_sections():
    assert parse_operating_point("ngspice completed without an operating point table") == ({}, {})
