"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

test("ویرایشگر مدار: قطعه، اتصال، انشعاب، چرخش، تاریخچه و ذخیره‌سازی", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  try {
    await page.goto(process.env.ELECTROLAB_BASE_URL || "http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    assert.match(await page.title(), /ElectroLab AI/);
    await page.getByRole("button", { name: /مدار جدید/ }).click();
    await page.locator('[data-add="V"]').click();
    await page.locator('[data-add="R"]').click();
    assert.equal(await page.locator("#partCount").textContent(), "2");
    assert.match(await page.locator("#netlist").inputValue(), /V1/);
    assert.match(await page.locator("#netlist").inputValue(), /R1/);

    await page.locator("#wireMode").click();
    await page.locator('[data-terminal="V1:1"]').click();
    await page.locator('[data-terminal="R1:0"]').click();
    assert.equal(await page.locator("#wireCount").textContent(), "1");

    await page.locator("#wireMode").click();

    const wireMidpoint = await page.locator("#circuit").evaluate(svg => {
      const point = svg.createSVGPoint();
      point.x = 247;
      point.y = 110;
      const screenPoint = point.matrixTransform(svg.getScreenCTM());
      return { x: screenPoint.x, y: screenPoint.y };
    });
    await page.locator('[data-wire-index="0"]').evaluate((wire, point) => {
      wire.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        view: window,
        clientX: point.x,
        clientY: point.y
      }));
    }, wireMidpoint);
    assert.equal(await page.locator("#circuit .junction-dot").count(), 1);
    assert.equal(await page.locator("#wireCount").textContent(), "2");
    assert.match(await page.locator("#netlist").inputValue(), /n\d/);

    await page.locator("#circuit [data-part='R1']").click();
    const beforeRotate = await page.locator("#circuit [data-terminal='R1:0']").getAttribute("cy");
    await page.locator("#rotatePart").click();
    const afterRotate = await page.locator("#circuit [data-terminal='R1:0']").getAttribute("cy");
    assert.notEqual(afterRotate, beforeRotate, "rotation should move terminal coordinates");

    await page.locator("#undoBtn").click();
    assert.equal(await page.locator("#circuit [data-terminal='R1:0']").getAttribute("cy"), beforeRotate);
    await page.locator("#redoBtn").click();
    assert.equal(await page.locator("#circuit [data-terminal='R1:0']").getAttribute("cy"), afterRotate);

    const saved = await page.evaluate(() => localStorage.getItem("electrolab-circuit-v1"));
    assert.ok(saved);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("#partCount").textContent(), "2");
    assert.equal(await page.locator("#circuit .junction-dot").count(), 1);
    assert.equal(await page.locator("#wireCount").textContent(), "2");

    const xBeforeDrag = await page.evaluate(() => JSON.parse(localStorage.getItem("electrolab-circuit-v1")).components.find(c => c.id === "R1").x);
    const partBox = await page.locator("#circuit [data-part='R1']").boundingBox();
    await page.mouse.move(partBox.x + partBox.width / 2, partBox.y + partBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(partBox.x + partBox.width / 2 + 60, partBox.y + partBox.height / 2 + 36, { steps: 4 });
    await page.mouse.up();
    const xAfterDrag = await page.evaluate(() => JSON.parse(localStorage.getItem("electrolab-circuit-v1")).components.find(c => c.id === "R1").x);
    assert.notEqual(xAfterDrag, xBeforeDrag, "dragging should update component position");

    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.locator("#circuit").isVisible());
    assert.equal(await page.locator("#partCount").textContent(), "2");
    assert.deepEqual(pageErrors, [], "browser page should not throw uncaught errors");
  } finally {
    await browser.close();
  }
});

test("پنل اعتبارسنجی خطاهای الکتریکی را در رابط نمایش می‌دهد", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(process.env.ELECTROLAB_BASE_URL || "http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.setItem("electrolab-circuit-v1", JSON.stringify({
        components: [{ id: "R1", type: "R", value: "invalid", x: 240, y: 180 }],
        wires: [{ a: "R1:0", b: "R1:1" }],
        grounds: [],
        junctions: []
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    const issues = await page.locator("#graphIssues").innerText();
    assert.match(issues, /اتصال کوتاه/);
    assert.match(issues, /مقدار قطعه R1 معتبر نیست/);
    assert.match(issues, /زمین/);
    assert.match(await page.locator("#graphStatus").innerText(), /خطای اتصال/);
  } finally {
    await browser.close();
  }
});

test("اجرای شبیه‌سازی: خطای ساختاری مسدود و نتایج API در جدول نمایش داده می‌شوند", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let simulationRequests = 0;
  try {
    await page.goto(process.env.ELECTROLAB_BASE_URL || "http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("electrolab-circuit-v1", JSON.stringify({
      components: [{ id: "R1", type: "R", value: "1k", x: 240, y: 180 }],
      wires: [{ a: "R1:0", b: "R1:1" }], grounds: [], junctions: []
    })));
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("#runBtn").click();
    assert.match(await page.locator("#runState").innerText(), /اجرای مسدود شد/);
    assert.match(await page.locator("#output").innerText(), /خطاهای ساختاری/);
    assert.equal(simulationRequests, 0);

    await page.evaluate(() => localStorage.setItem("electrolab-circuit-v1", JSON.stringify({
      components: [
        { id: "V1", type: "V", value: "5", x: 180, y: 220 },
        { id: "R1", type: "R", value: "1k", x: 510, y: 220 }
      ],
      wires: [{ a: "V1:0", b: "R1:0" }, { a: "R1:1", b: "V1:1" }],
      grounds: ["V1:1"], junctions: []
    })));
    await page.route("**/api/v1/simulations/ngspice", async route => {
      simulationRequests++;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        engine: "ngspice", status: "COMPLETED", output: "Operating point fixture",
        elapsed_ms: 12, message: "ok",
        node_voltages: { n1: 5, "0": 0 },
        branch_currents: { "v1#branch": -0.005 }
      }) });
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("#runBtn").click();
    await page.waitForFunction(() => document.querySelector("#simulationTables").hidden === false);
    assert.equal(simulationRequests, 1);
    assert.match(await page.locator("#nodeResults").innerText(), /n1/);
    assert.match(await page.locator("#nodeResults").innerText(), /5\.000000e\+0/);
    assert.match(await page.locator("#currentResults").innerText(), /v1#branch/);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportResultsCsv").click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "electrolab-results.csv");
    const stream = await download.createReadStream();
    let csv = "";
    for await (const chunk of stream) csv += chunk.toString("utf8");
    assert.match(csv, /ولتاژ گره/);
    assert.match(csv, /n1/);
    assert.match(csv, /جریان شاخه منبع/);
    assert.match(csv, /v1#branch/);
  } finally {
    await browser.close();
  }
});
