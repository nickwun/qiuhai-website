import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { chromium } from "playwright";

const root = new URL("..", import.meta.url).pathname;
const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];
const paths = [
  "/",
  "/articles/",
  "/works/",
  "/preview/samples/",
  "/preview/samples/long-form-layout-sample/",
];

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, description, timeout = 30_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    try {
      const result = await check();
      if (result) return result;
    } catch {
      // The process may still be starting; retry until the bounded deadline.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

let devServer;
let browser;
let devOutput = "";

try {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  devServer = spawn("npm", ["run", "dev", "--", "--ignore-lock", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: root,
    env: { ...process.env, ASTRO_DEV_BACKGROUND: "false", PUBLIC_INDEXING: "false" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  devServer.stdout.on("data", (chunk) => (devOutput += chunk));
  devServer.stderr.on("data", (chunk) => (devOutput += chunk));

  await waitFor(async () => (await fetch(`${baseUrl}/preview/samples/`)).status === 200, "Astro development server");

  browser = await chromium.launch({
    headless: true,
    executablePath: chromium.executablePath(),
    ignoreDefaultArgs: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  const results = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });

    for (const path of paths) {
      const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${path} returned ${response?.status()}`);

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const insideHorizontalScroller = (element) => {
          let ancestor = element.parentElement;
          while (ancestor && ancestor !== document.body) {
            const overflowX = getComputedStyle(ancestor).overflowX;
            const rect = ancestor.getBoundingClientRect();
            if (["auto", "scroll"].includes(overflowX) && rect.left >= -0.5 && rect.right <= root.clientWidth + 0.5)
              return true;
            ancestor = ancestor.parentElement;
          }
          return false;
        };
        const ignored = (element) => element.classList.contains("skip-link") || insideHorizontalScroller(element);
        const overflowers = Array.from(document.querySelectorAll("body *"))
          .filter((element) => !ignored(element))
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.left < -0.5 || rect.right > root.clientWidth + 0.5)
          .slice(0, 8)
          .map(({ element, rect }) => ({
            element: element.tagName.toLowerCase() + (element.className ? "." + String(element.className).trim().replaceAll(" ", ".") : ""),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          }));
        const cards = Array.from(document.querySelectorAll(".article-card")).map((card) => {
          const rect = card.getBoundingClientRect();
          const parent = card.parentElement.getBoundingClientRect();
          return {
            inside: rect.left >= parent.left - 0.5 && rect.right <= parent.right + 0.5,
            width: Math.round(rect.width),
            parentWidth: Math.round(parent.width),
          };
        });
        const wideElements = Array.from(document.querySelectorAll("body *"))
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .slice(0, 12)
          .map((element) => ({
            element: element.tagName.toLowerCase() + (element.className ? "." + String(element.className).trim().replaceAll(" ", ".") : ""),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: getComputedStyle(element).overflowX,
          }));
        const visibleText = Array.from(document.querySelectorAll("h1, h2, .article-meta, .nav-list a"))
          .every((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.left >= -0.5 && rect.right <= root.clientWidth + 0.5;
          });
        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          overflowers,
          cards,
          wideElements,
          visibleText,
        };
      });

      assert.ok(metrics.scrollWidth <= metrics.clientWidth, `${width}px ${path}: scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth}; overflowers ${JSON.stringify(metrics.overflowers)}; wide ${JSON.stringify(metrics.wideElements)}`);
      assert.deepEqual(metrics.overflowers, [], `${width}px ${path}: overflowing elements ${JSON.stringify(metrics.overflowers)}`);
      assert.ok(metrics.cards.every((card) => card.inside && card.width <= card.parentWidth + 1), `${width}px ${path}: card exceeds container`);
      assert.equal(metrics.visibleText, true, `${width}px ${path}: visible text was clipped`);
      results.push({ width, path });
    }
  }

  assert.deepEqual(browserErrors, [], `browser console errors: ${browserErrors.join("; ")}`);
  console.log(`responsive browser verification: ${results.length} route/viewport combinations passed`);
} catch (error) {
  throw new Error(`${error.message}${devOutput ? `\nAstro output:\n${devOutput}` : ""}`);
} finally {
  await browser?.close();
  if (devServer?.pid) {
    try {
      process.kill(-devServer.pid, "SIGTERM");
    } catch {
      // The process group may already have exited.
    }
  }
}
