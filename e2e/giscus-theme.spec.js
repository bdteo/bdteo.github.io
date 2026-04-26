const { test, expect } = require("@playwright/test")

async function goToPost(page) {
  await page.goto("/")
  await page.waitForSelector(".blog-card-link", { timeout: 10000 })
  const firstLink = page.locator(".blog-card-link").first()
  const href = await firstLink.getAttribute("href")
  await page.goto(href)
  await page.waitForSelector(".blog-post", { timeout: 10000 })
}

async function getGiscusFrame(page) {
  await page.waitForFunction(
    () => {
      const widget = document.querySelector("giscus-widget")
      if (!widget || !widget.shadowRoot) return false
      const iframe = widget.shadowRoot.querySelector("iframe")
      return iframe && iframe.src.includes("giscus.app")
    },
    { timeout: 15000 },
  )

  const iframeHandle = await page.evaluateHandle(() => {
    const widget = document.querySelector("giscus-widget")
    return widget.shadowRoot.querySelector("iframe")
  })

  return await iframeHandle.asElement().contentFrame()
}

test("debug: full link element details inside Giscus iframe", async ({
  page,
}) => {
  // Intercept network to see what happens with CSS requests inside the iframe
  const cssResponses = []
  page.on("response", res => {
    if (
      res.url().includes("/css/giscus/") ||
      res.url().includes("dark") ||
      res.url().includes("light")
    ) {
      cssResponses.push({
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
      })
    }
  })

  page.on("requestfailed", req => {
    if (
      req.url().includes("/css/giscus/") ||
      req.url().includes("dark") ||
      req.url().includes("light")
    ) {
      cssResponses.push({
        url: req.url(),
        failure: req.failure()?.errorText || "unknown",
      })
    }
  })

  await goToPost(page)
  await page.evaluate(() => localStorage.setItem("theme", "dark-mode"))
  await page.reload()
  await page.waitForSelector(".blog-post", { timeout: 10000 })
  await page.locator(".comments-container").scrollIntoViewIfNeeded()

  // Wait longer for CSS to load
  await page.waitForTimeout(8000)

  const frame = await getGiscusFrame(page)
  await frame.waitForSelector("main", { timeout: 10000 })

  const debug = await frame.evaluate(() => {
    // Get all link elements with full attributes
    const links = Array.from(document.querySelectorAll("link")).map(l => ({
      rel: l.getAttribute("rel"),
      href: l.getAttribute("href"),
      crossorigin: l.getAttribute("crossorigin"),
      type: l.getAttribute("type"),
      media: l.getAttribute("media"),
      disabled: l.disabled,
      sheetNull: l.sheet === null,
      sheetRules: (() => {
        try {
          return l.sheet?.cssRules?.length ?? "null sheet"
        } catch (e) {
          return "CORS: " + e.message
        }
      })(),
    }))

    // Get full head innerHTML
    const headHTML = document.head.innerHTML

    // Check document.styleSheets
    const sheets = Array.from(document.styleSheets).map(s => ({
      href: s.href,
      disabled: s.disabled,
      rulesCount: (() => {
        try {
          return s.cssRules.length
        } catch (e) {
          return "ERROR: " + e.message
        }
      })(),
    }))

    // Computed styles on main
    const main = document.querySelector("main")
    const cs = main ? window.getComputedStyle(main) : null

    return {
      links,
      sheets,
      headSnippet: headHTML.substring(0, 2000),
      mainVars: cs
        ? {
            canvasDefault: cs.getPropertyValue("--color-canvas-default"),
            fgDefault: cs.getPropertyValue("--color-fg-default"),
          }
        : "no main",
    }
  })

  console.log("\n=== LINK ELEMENTS ===")
  console.log(JSON.stringify(debug.links, null, 2))
  console.log("\n=== DOCUMENT.STYLESHEETS ===")
  console.log(JSON.stringify(debug.sheets, null, 2))
  console.log("\n=== MAIN CSS VARS ===")
  console.log(JSON.stringify(debug.mainVars, null, 2))
  console.log("\n=== CSS NETWORK RESPONSES ===")
  console.log(JSON.stringify(cssResponses, null, 2))
  console.log("\n=== HEAD HTML (first 2000 chars) ===")
  console.log(debug.headSnippet)
})
