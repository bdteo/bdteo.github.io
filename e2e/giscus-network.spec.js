const { test, expect } = require("@playwright/test")

test("capture dark mode network requests", async ({ page }) => {
  const cssRequests = []

  page.on("request", req => {
    if (req.url().includes("giscus") || req.url().includes("theme")) {
      cssRequests.push({ url: req.url(), method: req.method() })
    }
  })

  page.on("response", res => {
    if (res.url().includes("dark-theme") || res.url().includes("light-theme")) {
      cssRequests.push({
        url: res.url(),
        status: res.status(),
        headers: Object.fromEntries(
          Object.entries(res.headers()).filter(
            ([k]) =>
              k.includes("cors") ||
              k.includes("access") ||
              k.includes("content-type") ||
              k.includes("cache"),
          ),
        ),
      })
    }
  })

  await page.goto("/")
  await page.waitForSelector(".blog-card-link", { timeout: 10000 })
  const href = await page
    .locator(".blog-card-link")
    .first()
    .getAttribute("href")

  await page.evaluate(() => localStorage.setItem("theme", "dark-mode"))
  await page.goto(href)
  await page.waitForSelector(".blog-post", { timeout: 10000 })
  await page.locator(".comments-container").scrollIntoViewIfNeeded()
  await page.waitForTimeout(5000)

  console.log("\n=== NETWORK REQUESTS (giscus/theme related) ===")
  for (const r of cssRequests) {
    console.log(JSON.stringify(r))
  }

  // Check what the iframe actually loaded
  const widget = await page.evaluate(() => {
    const w = document.querySelector("giscus-widget")
    if (!w) return "no widget"
    const sr = w.shadowRoot
    if (!sr) return "no shadow root"
    const iframe = sr.querySelector("iframe")
    if (!iframe) return "no iframe in shadow"
    return iframe.src
  })
  console.log("\n=== IFRAME SRC ===")
  console.log(widget)
})
