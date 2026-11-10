"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { analyze } = require("../../docs/validator.js");

const validCircuit = () => ({
  components: [
    { id: "V1", type: "V", value: "5" },
    { id: "R1", type: "R", value: "1k" }
  ],
  wires: [
    { a: "V1:0", b: "R1:0" },
    { a: "V1:1", b: "R1:1" }
  ],
  grounds: ["V1:1"],
  junctions: []
});

const codes = circuit => analyze(circuit).map(issue => issue.code);

test("مدار DC سالم را بدون هشدار توپولوژی می‌پذیرد", () => {
  assert.deepEqual(analyze(validCircuit()), []);
});

test("اتصال دو پایه یک قطعه را اتصال کوتاه تشخیص می‌دهد", () => {
  const circuit = validCircuit();
  circuit.wires.push({ a: "R1:0", b: "R1:1" });
  assert.ok(codes(circuit).includes("short_circuit"));
});

test("پایه بدون سیم یا زمین را شناسایی می‌کند", () => {
  const circuit = { components: [{ id: "R1", type: "R", value: "10k" }], wires: [], grounds: ["R1:0"], junctions: [] };
  assert.ok(codes(circuit).includes("open_terminal"));
});

test("مدار بدون مرجع زمین را هشدار می‌دهد", () => {
  const circuit = { components: [{ id: "R1", type: "R", value: "1k" }], wires: [], grounds: [], junctions: [] };
  assert.ok(codes(circuit).includes("missing_ground"));
});

test("زیرمدار جدا و شناور را شناسایی می‌کند", () => {
  const circuit = {
    components: [
      { id: "R1", type: "R", value: "1k" },
      { id: "R2", type: "R", value: "2k" }
    ],
    wires: [],
    grounds: ["R1:0"],
    junctions: []
  };
  assert.ok(codes(circuit).includes("floating_subcircuit"));
});

test("مقدار و شناسه ناسازگار قطعه را رد می‌کند", () => {
  const circuit = { components: [{ id: "R1", type: "R", value: "python" }, { id: "R1", type: "R", value: "1k" }], wires: [], grounds: [], junctions: [] };
  const result = codes(circuit);
  assert.ok(result.includes("invalid_component_value"));
  assert.ok(result.includes("duplicate_component_id"));
});

test("سیم تکراری و سیم با مقصد ناموجود را تشخیص می‌دهد", () => {
  const circuit = validCircuit();
  circuit.wires.push({ a: "V1:0", b: "R1:0" }, { a: "R9:0", b: "R1:1" });
  const result = codes(circuit);
  assert.ok(result.includes("duplicate_wire"));
  assert.ok(result.includes("dangling_wire"));
});

test("گره انشعاب بدون اتصال را هشدار می‌دهد", () => {
  const circuit = validCircuit();
  circuit.junctions.push({ id: "J1", x: 120, y: 120 });
  assert.ok(codes(circuit).includes("orphan_junction"));
});

test("دو منبع ولتاژ موازی را هشدار می‌دهد", () => {
  const circuit = {
    components: [
      { id: "V1", type: "V", value: "5" },
      { id: "V2", type: "V", value: "5" }
    ],
    wires: [
      { a: "V1:0", b: "V2:0" },
      { a: "V1:1", b: "V2:1" }
    ],
    grounds: ["V1:1"],
    junctions: []
  };
  assert.ok(codes(circuit).includes("parallel_voltage_sources"));
});
