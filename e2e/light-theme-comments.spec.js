const { test, expect } = require('@playwright/test');

// Navigate to first blog post
async function goToPost(page) {
  await page.goto('/');
  await page.waitForSelector('.blog-card-link', { timeout: 10000 });
  const firstLink = page.locator('.blog-card-link').first();
  const href = await firstLink.getAttribute('href');
  await page.goto(href);
  await page.waitForSelector('.blog-post', { timeout: 10000 });
}

// Switch to light mode via the theme toggle button
async function switchToLightMode(page) {
  // Set localStorage directly and reload for clean state
  await page.evaluate(() => localStorage.setItem('theme', 'light-mode'));
  await page.reload();
  await page.waitForSelector('.blog-post', { timeout: 10000 });
  // Verify light mode is active
  const bodyClass = await page.evaluate(() => document.body.className);
  expect(bodyClass).toContain('light-mode');
}

// Parse a CSS color string into { r, g, b, a }
function parseColor(color) {
  const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!rgba) return null;
  return {
    r: parseInt(rgba[1]),
    g: parseInt(rgba[2]),
    b: parseInt(rgba[3]),
    a: rgba[4] !== undefined ? parseFloat(rgba[4]) : 1,
  };
}

// Relative luminance per WCAG 2.0
function luminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// WCAG contrast ratio between two colors
function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Blend a foreground color (with alpha) onto a background color
function blendAlpha(fg, bg) {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

// ─── Light Theme Text Visibility ───
test.describe('Light Theme - Text Visibility on Blog Posts', () => {
  test.beforeEach(async ({ page }) => {
    await goToPost(page);
    await switchToLightMode(page);
  });

  test('post title is visible (sufficient contrast)', async ({ page }) => {
    const h1 = page.locator('.blog-post h1');
    await expect(h1).toBeVisible();

    const { color, bgColor } = await h1.evaluate(el => {
      const style = window.getComputedStyle(el);
      // Walk up to find a non-transparent background
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA
  });

  test('post date is visible', async ({ page }) => {
    const date = page.locator('.blog-post header p');
    await expect(date).toBeVisible();

    const { color, bgColor } = await date.evaluate(el => {
      const style = window.getComputedStyle(el);
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(3.0); // AA for large/secondary text
  });

  test('Comments heading is visible', async ({ page }) => {
    const heading = page.locator('.comments-container h2');
    await expect(heading).toBeVisible();

    const { color, bgColor } = await heading.evaluate(el => {
      const style = window.getComputedStyle(el);
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('breadcrumb text is visible', async ({ page }) => {
    const breadcrumb = page.locator('.breadcrumb a');
    await expect(breadcrumb).toBeVisible();

    const { color, bgColor } = await breadcrumb.evaluate(el => {
      const style = window.getComputedStyle(el);
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  test('article body text is visible', async ({ page }) => {
    const paragraph = page.locator('.blog-post [itemprop="articleBody"] p').first();
    await expect(paragraph).toBeVisible();

    const { color, bgColor } = await paragraph.evaluate(el => {
      const style = window.getComputedStyle(el);
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('prev/next nav links are visible', async ({ page }) => {
    const navLinks = page.locator('.blog-post-nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const { color, bgColor } = await link.evaluate(el => {
        const style = window.getComputedStyle(el);
        let bg = style.backgroundColor;
        let parent = el.parentElement;
        while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
          bg = window.getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
        return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
      });

      const fg = parseColor(color);
      const bg = parseColor(bgColor);
      const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
      const ratio = contrastRatio(effective, bg);

      expect(ratio).toBeGreaterThanOrEqual(3.0);
    }
  });

  test('bio section text is visible', async ({ page }) => {
    const bioName = page.locator('.bio .bio-name');
    await expect(bioName).toBeVisible();

    const { color, bgColor } = await bioName.evaluate(el => {
      const style = window.getComputedStyle(el);
      let bg = style.backgroundColor;
      let parent = el.parentElement;
      while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(parent).backgroundColor;
        parent = parent.parentElement;
      }
      return { color: style.color, bgColor: bg || 'rgb(255, 255, 255)' };
    });

    const fg = parseColor(color);
    const bg = parseColor(bgColor);
    const effective = fg.a < 1 ? blendAlpha(fg, bg) : fg;
    const ratio = contrastRatio(effective, bg);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('dump all computed colors for debugging', async ({ page }) => {
    const elements = await page.evaluate(() => {
      const selectors = [
        { name: 'body', sel: 'body' },
        { name: 'h1 (post title)', sel: '.blog-post h1' },
        { name: 'header p (date)', sel: '.blog-post header p' },
        { name: 'article body p', sel: '.blog-post [itemprop="articleBody"] p' },
        { name: 'Comments h2', sel: '.comments-container h2' },
        { name: 'breadcrumb link', sel: '.breadcrumb a' },
        { name: 'breadcrumb current', sel: '.breadcrumb-current' },
        { name: 'nav link', sel: '.blog-post-nav a' },
        { name: 'bio name', sel: '.bio .bio-name' },
        { name: 'bio intro', sel: '.bio .bio-intro' },
        { name: 'bio summary', sel: '.bio .bio-summary' },
      ];

      return selectors.map(({ name, sel }) => {
        const el = document.querySelector(sel);
        if (!el) return { name, found: false };
        const style = window.getComputedStyle(el);

        // Find effective background
        let bg = style.backgroundColor;
        let bgSource = sel;
        let parent = el.parentElement;
        while (parent && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
          bg = window.getComputedStyle(parent).backgroundColor;
          bgSource = parent.tagName.toLowerCase() + (parent.className ? '.' + parent.className.split(' ')[0] : '');
          parent = parent.parentElement;
        }

        return {
          name,
          found: true,
          color: style.color,
          backgroundColor: bg,
          bgSource,
          opacity: style.opacity,
        };
      });
    });

    console.log('\n=== LIGHT THEME COLOR DUMP ===');
    for (const el of elements) {
      if (!el.found) {
        console.log(`  ${el.name}: NOT FOUND`);
        continue;
      }
      console.log(`  ${el.name}: color=${el.color} bg=${el.backgroundColor} (from ${el.bgSource}) opacity=${el.opacity}`);
    }
    console.log('=== END COLOR DUMP ===\n');

    // Just ensure all elements exist
    const missing = elements.filter(e => !e.found);
    expect(missing).toHaveLength(0);
  });
});
