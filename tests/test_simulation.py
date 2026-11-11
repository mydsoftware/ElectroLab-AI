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


def test_parser_accepts_signed_scientific_values_and_whitespace():
    output = """Operating Point
Node Voltage
------------
  input  +5.000000e+00
  output -2.5e-1
Voltage source currents
-----------------------
  VMAIN#branch -1.250e-03
"""
    nodes, currents = parse_operating_point(output)
    assert nodes == {"input": 5.0, "output": -0.25}
    assert currents == {"VMAIN#branch": -0.00125}


def test_parser_stops_at_unrecognized_section_and_does_not_capture_its_numbers():
    output = """Node Voltage
------------
in 5.0
Device operating summary
sensor_reading 999.0
Voltage source currents
-----------------------
V1#branch -0.005
"""
    nodes, currents = parse_operating_point(output)
    assert nodes == {"in": 5.0}
    assert currents == {"V1#branch": -0.005}


def test_parser_ignores_malformed_and_non_finite_rows():
    output = """Node Voltage
------------
good 1.25
bad nan
also_bad inf
not_a_value
Voltage source currents
-----------------------
V1#branch 2.0e-3
"""
    nodes, currents = parse_operating_point(output)
    assert nodes == {"good": 1.25}
    assert currents == {"V1#branch": 0.002}


def test_parser_handles_empty_and_unrelated_output():
    assert parse_operating_point("") == ({}, {})
    assert parse_operating_point("Error: singular matrix\\nNo operating point") == ({}, {})
