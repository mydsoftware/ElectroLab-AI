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

    const wireMidpoint = await page.locator("#circuit").evaluate(svg => {
      const point = svg.createSVGPoint();
      point.x = 247;
      point.y = 110;
      const screenPoint = point.matrixTransform(svg.getScreenCTM());
      return { x: screenPoint.x, y: screenPoint.y };
    });
    await page.mouse.click(wireMidpoint.x, wireMidpoint.y);
    assert.equal(await page.locator("#circuit .junction-dot").count(), 1);
    assert.equal(await page.locator("#wireCount").textContent(), "2");
    assert.match(await page.locator("#netlist").inputValue(), /n\\d/);

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
