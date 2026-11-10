(function (root) {
  "use strict";

  const TYPES = new Set(["R", "C", "L", "V", "I"]);
  const VALUE = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?[TGMKUNPF]$/i;

  function analyze(circuit) {
    const issues = [];
    const components = Array.isArray(circuit?.components) ? circuit.components : [];
    const wires = Array.isArray(circuit?.wires) ? circuit.wires : [];
    const grounds = Array.isArray(circuit?.grounds) ? circuit.grounds : [];
    const junctions = Array.isArray(circuit?.junctions) ? circuit.junctions : [];
    const ids = new Set();
    const terminals = new Set();
    const junctionKeys = new Set(junctions.map(j => "J:" + j.id));
    const degree = new Map();
    const wireParent = new Map();
    const networkParent = new Map();

    const issue = (level, code, text) => issues.push({ level, code, text });
    const addNode = (key) => {
      wireParent.set(key, key);
      networkParent.set(key, key);
      degree.set(key, 0);
    };
    const find = (parent, key) => {
      if (!parent.has(key)) return null;
      let current = key;
      while (parent.get(current) !== current) current = parent.get(current);
      let cursor = key;
      while (parent.get(cursor) !== cursor) {
        const next = parent.get(cursor);
        parent.set(cursor, current);
        cursor = next;
      }
      return current;
    };
    const join = (parent, a, b) => {
      const ra = find(parent, a), rb = find(parent, b);
      if (ra && rb && ra !== rb) parent.set(ra, rb);
    };

    for (const c of components) {
      const id = String(c?.id ?? "");
      const type = String(c?.type ?? "").toUpperCase();
      if (!TYPES.has(type)) issue("error", "unsupported_component", "نوع قطعه " + id + " پشتیبانی نمی‌شود.");
      if (!new RegExp("^" + type + "[A-Za-z0-9_]{0,10}$").test(id)) {
        issue("error", "invalid_component_id", "شناسه قطعه " + id + " با نوع قطعه سازگار نیست.");
      }
      if (ids.has(id)) issue("error", "duplicate_component_id", "شناسه قطعه " + id + " تکراری است.");
      ids.add(id);
      if (!VALUE.test(String(c?.value ?? ""))) {
        issue("error", "invalid_component_value", "مقدار قطعه " + id + " معتبر نیست.");
      }
      for (let pin = 0; pin < 2; pin++) {
        const key = id + ":" + pin;
        terminals.add(key);
        addNode(key);
      }
    }

    for (const j of junctions) {
      const key = "J:" + String(j?.id ?? "");
      if (!j?.id || !Number.isFinite(j.x) || !Number.isFinite(j.y)) {
        issue("error", "invalid_junction", "مختصات یا شناسه یک گره انشعاب نامعتبر است.");
      }
      if (wireParent.has(key)) issue("error", "duplicate_junction_id", "شناسه گره انشعاب " + j.id + " تکراری است.");
      else addNode(key);
    }

    const known = key => terminals.has(key) || junctionKeys.has(key);
    const seenWires = new Set();
    for (const w of wires) {
      const a = String(w?.a ?? ""), b = String(w?.b ?? "");
      if (!known(a) || !known(b)) {
        issue("error", "dangling_wire", "یک سیم به ترمینال یا گره انشعاب ناموجود متصل شده است.");
        continue;
      }
      if (a === b) {
        issue("error", "zero_length_wire", "سیم نمی‌تواند ابتدا و انتهای یکسان داشته باشد.");
        continue;
      }
      const pair = [a, b].sort().join("|");
      if (seenWires.has(pair)) issue("warning", "duplicate_wire", "اتصال سیم تکراری در مدار وجود دارد.");
      seenWires.add(pair);
      degree.set(a, degree.get(a) + 1);
      degree.set(b, degree.get(b) + 1);
      join(wireParent, a, b);
      join(networkParent, a, b);
    }

    for (const c of components) {
      const a = String(c.id) + ":0", b = String(c.id) + ":1";
      if (find(wireParent, a) === find(wireParent, b)) {
        issue("error", "short_circuit", c.id + " اتصال کوتاه شده است؛ دو پایه قطعه در یک گره قرار دارند.");
      }
      join(networkParent, a, b);
      for (const key of [a, b]) {
        if (degree.get(key) === 0 && !grounds.includes(key)) {
          issue("warning", "open_terminal", key + " آزاد است و به سیم یا زمین متصل نیست.");
        }
      }
    }

    const validGrounds = grounds.filter(key => known(key));
    for (const key of grounds) {
      if (!known(key)) issue("error", "invalid_ground", "گره زمین به ترمینال یا انشعاب ناموجود اشاره می‌کند.");
      else degree.set(key, degree.get(key) + 1);
    }
    if (components.length && validGrounds.length === 0) {
      issue("warning", "missing_ground", "هیچ گره مرجعی به زمین (۰) متصل نشده است.");
    } else if (validGrounds.length) {
      const groundedIslands = new Set(validGrounds.map(key => find(networkParent, key)));
      const reported = new Set();
      for (const c of components) {
        const island = find(networkParent, c.id + ":0");
        if (!groundedIslands.has(island) && !reported.has(island)) {
          reported.add(island);
          issue("warning", "floating_subcircuit", "یک بخش از مدار به زمین مرجع متصل نیست (مدار شناور).");
        }
      }
    }

    for (const j of junctions) {
      const key = "J:" + j.id;
      if (degree.has(key) && degree.get(key) === 0) {
        issue("warning", "orphan_junction", "گره انشعاب " + j.id + " به هیچ سیمی متصل نیست.");
      }
    }

    const voltageSources = components.filter(c => String(c?.type).toUpperCase() === "V");
    const sourcePairs = new Map();
    for (const source of voltageSources) {
      const pair = [find(wireParent, source.id + ":0"), find(wireParent, source.id + ":1")].sort().join("|");
      if (sourcePairs.has(pair)) {
        issue("warning", "parallel_voltage_sources", "چند منبع ولتاژ ایده‌آل به یک جفت گره موازی متصل‌اند؛ امکان ناسازگاری یا تکین‌شدن حل وجود دارد.");
        break;
      }
      sourcePairs.set(pair, source.id);
    }

    return issues;
  }

  const api = Object.freeze({ analyze });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ElectroLabValidator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
