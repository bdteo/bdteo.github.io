const { test, expect } = require('@playwright/test');

const RECENT_POSTS_COUNT = 3;

// ─── Card Rendering ───
test.describe('Homepage - Card Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
  });

  test('renders Recent Posts section with exactly 3 cards', async ({ page }) => {
    const recentSection = page.locator('.section').filter({ hasText: 'Recent Posts' });
    const recentCards = recentSection.locator('.blog-card');
    await expect(recentCards).toHaveCount(RECENT_POSTS_COUNT);
  });

  test('renders More Posts section with remaining cards', async ({ page }) => {
    const moreSection = page.locator('.section').filter({ hasText: 'More Posts' });
    await expect(moreSection).toBeVisible();
    const moreCards = moreSection.locator('.blog-card');
    const count = await moreCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('total card count matches all posts', async ({ page }) => {
    const allCards = page.locator('.blog-card');
    const count = await allCards.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('all cards have a title', async ({ page }) => {
    const titles = page.locator('.blog-card-title');
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('all cards have a date badge', async ({ page }) => {
    const dates = page.locator('.blog-card-date');
    const count = await dates.count();
    for (let i = 0; i < count; i++) {
      const text = await dates.nth(i).textContent();
      expect(text.trim()).toMatch(/\w+ \d{1,2}, \d{4}/);
    }
  });

  test('each card links to a valid post URL', async ({ page }) => {
    const links = page.locator('.blog-card-link');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//);
    }
  });

  test('clicking a card navigates to the post', async ({ page }) => {
    const firstLink = page.locator('.blog-card-link').first();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    await page.waitForURL(`**${href}`);
    expect(page.url()).toContain(href);
  });
});

// ─── Scroll Reveal Animation ───
test.describe('Homepage - Scroll Reveal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
  });

  test('cards in viewport on load are visible immediately', async ({ page }) => {
    await page.waitForTimeout(300);
    const visibleCards = page.locator('.scroll-reveal.is-visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('cards in viewport on load have no-transition class (instant reveal)', async ({ page }) => {
    await page.waitForTimeout(300);
    const instantCards = page.locator('.scroll-reveal.is-visible.no-transition');
    const count = await instantCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('visible cards have opacity 1', async ({ page }) => {
    await page.waitForTimeout(300);
    const visibleCards = page.locator('.scroll-reveal.is-visible');
    const count = await visibleCards.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      const opacity = await visibleCards.nth(i).evaluate(el =>
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBe(1);
    }
  });

  test('cards below fold start invisible', async ({ page }) => {
    await page.waitForTimeout(300);
    const allReveals = page.locator('.scroll-reveal');
    const totalCount = await allReveals.count();

    // At least some cards should not yet be visible
    const visibleCount = await page.locator('.scroll-reveal.is-visible').count();
    if (totalCount > 6) {
      expect(visibleCount).toBeLessThan(totalCount);
    }
  });

  test('scrolling reveals cards below the fold', async ({ page }) => {
    await page.waitForTimeout(300);

    const initialVisible = await page.locator('.scroll-reveal.is-visible').count();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const afterScrollVisible = await page.locator('.scroll-reveal.is-visible').count();
    expect(afterScrollVisible).toBeGreaterThan(initialVisible);
  });

  test('all cards become visible after scrolling to bottom', async ({ page }) => {
    const totalCards = await page.locator('.scroll-reveal').count();

    // Scroll progressively to bottom
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }

    const visibleCards = await page.locator('.scroll-reveal.is-visible').count();
    expect(visibleCards).toBe(totalCards);
  });
});

// ─── Scroll Restore (refresh while scrolled) ───
test.describe('Homepage - Scroll Position Restore', () => {
  test('refreshing while scrolled down does NOT show blank screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    // Scroll down to middle of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Reload the page (browser will try to restore scroll position)
    await page.reload();
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Cards currently in viewport should be visible (not blank)
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const scrollY = await page.evaluate(() => window.scrollY);

    const visibleInViewport = await page.evaluate(({ scrollY, viewportHeight }) => {
      const cards = document.querySelectorAll('.scroll-reveal');
      let count = 0;
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < viewportHeight && rect.bottom > 0) {
          count++;
        }
      });
      return count;
    }, { scrollY, viewportHeight });

    // All cards in the viewport should be visible (have is-visible class)
    const visibleWithClass = await page.evaluate(({ viewportHeight }) => {
      const cards = document.querySelectorAll('.scroll-reveal');
      let count = 0;
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < viewportHeight && rect.bottom > 0 && card.classList.contains('is-visible')) {
          count++;
        }
      });
      return count;
    }, { viewportHeight });

    expect(visibleWithClass).toBe(visibleInViewport);
    expect(visibleWithClass).toBeGreaterThan(0);
  });

  test('cards above current scroll position are also visible after restore', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);

    await page.reload();
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Top cards should be visible
    const topCard = page.locator('.scroll-reveal').first();
    await expect(topCard).toHaveClass(/is-visible/);
  });
});

// ─── Card Interactions ───
test.describe('Homepage - Card Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.waitForTimeout(300);
  });

  test('hovering a card changes its border color', async ({ page }) => {
    const card = page.locator('.blog-card').first();
    const borderBefore = await card.evaluate(el => getComputedStyle(el).borderColor);
    await card.hover();
    await page.waitForTimeout(400);
    const borderAfter = await card.evaluate(el => getComputedStyle(el).borderColor);
    expect(borderAfter).not.toBe(borderBefore);
  });

  test('hovering a card scales it up', async ({ page }) => {
    const card = page.locator('.blog-card').first();
    await card.hover();
    await page.waitForTimeout(700);
    const transform = await card.evaluate(el => getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });

  test('hovering dims sibling cards', async ({ page }) => {
    const cards = page.locator('.blog-card');
    if (await cards.count() < 2) return;

    await cards.first().hover();
    await page.waitForTimeout(900);

    const siblingFilter = await cards.nth(1).evaluate(el => getComputedStyle(el).filter);
    expect(siblingFilter).toContain('brightness');
    expect(siblingFilter).not.toBe('none');
  });
});

// ─── Card Sizing & Layout ───
test.describe('Homepage - Card Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
  });

  test('card border-radius is sharp (<=4px)', async ({ page }) => {
    const card = page.locator('.blog-card').first();
    const br = await card.evaluate(el => parseFloat(getComputedStyle(el).borderRadius));
    expect(br).toBeLessThanOrEqual(4);
  });

  test('cards have no box-shadow', async ({ page }) => {
    const card = page.locator('.blog-card').first();
    const shadow = await card.evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');
  });

  test('grid has proper gap between cards', async ({ page }) => {
    const cards = page.locator('.grid-container .scroll-reveal');
    if (await cards.count() < 2) return;

    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    if (box1 && box2 && Math.abs(box1.y - box2.y) < 5) {
      const gap = box2.x - (box1.x + box1.width);
      expect(gap).toBeGreaterThan(8);
    }
  });
});

// ─── Responsive: Desktop ───
test.describe('Homepage - Desktop Layout', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('cards display in multi-column grid', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    const cards = page.locator('.grid-container .scroll-reveal');
    if (await cards.count() < 2) return;

    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(Math.abs(box2.y - box1.y)).toBeLessThan(5);
  });
});

// ─── Responsive: iPhone SE ───
test.describe('Homepage - iPhone SE (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('cards stack in single column', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    const cards = page.locator('.grid-container .scroll-reveal');
    if (await cards.count() < 2) return;

    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
  });

  test('scroll reveal works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.waitForTimeout(300);

    const initialVisible = await page.locator('.scroll-reveal.is-visible').count();
    expect(initialVisible).toBeGreaterThan(0);

    // Scroll progressively on mobile (small viewport needs multiple scrolls)
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }

    const afterVisible = await page.locator('.scroll-reveal.is-visible').count();
    expect(afterVisible).toBeGreaterThan(initialVisible);
  });

  test('cards are fully readable on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    const card = page.locator('.blog-card').first();
    const box = await card.boundingBox();
    expect(box.width).toBeGreaterThan(300);
    expect(box.width).toBeLessThanOrEqual(375);
  });
});

// ─── Responsive: iPhone 14 Pro Max ───
test.describe('Homepage - iPhone 14 Pro Max (430x932)', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('cards stack in single column', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    const cards = page.locator('.grid-container .scroll-reveal');
    if (await cards.count() < 2) return;

    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
  });

  test('scroll restore works on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });

    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);

    await page.reload();
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.waitForTimeout(500);

    const viewportCards = await page.evaluate(() => {
      const vh = window.innerHeight;
      let visible = 0;
      document.querySelectorAll('.scroll-reveal').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0 && el.classList.contains('is-visible')) visible++;
      });
      return visible;
    });
    expect(viewportCards).toBeGreaterThan(0);
  });
});

// ─── Header & Navigation ───
test.describe('Homepage - Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.global-header', { timeout: 10000 });
  });

  test('header height is 56px', async ({ page }) => {
    const box = await page.locator('.header-content').boundingBox();
    expect(box.height).toBe(56);
  });

  test('header has accent gradient line', async ({ page }) => {
    const height = await page.locator('.global-header').evaluate(el =>
      getComputedStyle(el, '::before').height
    );
    expect(parseFloat(height)).toBeGreaterThan(0);
  });

  test('nav links are uppercase mono', async ({ page }) => {
    const navLink = page.locator('.nav-link').first();
    const tt = await navLink.evaluate(el => getComputedStyle(el).textTransform);
    expect(tt).toBe('uppercase');
    const ff = await navLink.evaluate(el => getComputedStyle(el).fontFamily);
    expect(ff.toLowerCase()).toContain('jetbrains');
  });
});

// ─── Bio Section ───
test.describe('Homepage - Bio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.bio', { timeout: 10000 });
  });

  test('bio name uses JetBrains Mono', async ({ page }) => {
    const ff = await page.locator('.bio-name').first().evaluate(el =>
      getComputedStyle(el).fontFamily
    );
    expect(ff.toLowerCase()).toContain('jetbrains');
  });
});

// ─── Dark/Light Mode ───
test.describe('Homepage - Theme Modes', () => {
  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.theme-toggle-button', { timeout: 10000 });

    const before = await page.locator('body').getAttribute('class');
    await page.locator('.theme-toggle-button').click();
    await page.waitForTimeout(300);
    const after = await page.locator('body').getAttribute('class');
    expect(after).not.toBe(before);
  });

  test('cards have visible borders in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.evaluate(() => { document.body.className = 'dark-mode'; });
    await page.waitForTimeout(200);

    const bc = await page.locator('.blog-card').first().evaluate(el =>
      getComputedStyle(el).borderColor
    );
    expect(bc).not.toBe('rgba(0, 0, 0, 0)');
    expect(bc).not.toBe('transparent');
  });

  test('cards have visible borders in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    await page.evaluate(() => { document.body.className = 'light-mode'; });
    await page.waitForTimeout(200);

    const bc = await page.locator('.blog-card').first().evaluate(el =>
      getComputedStyle(el).borderColor
    );
    expect(bc).not.toBe('rgba(0, 0, 0, 0)');
    expect(bc).not.toBe('transparent');
  });
});

// ─── SEO ───
test.describe('Homepage - SEO', () => {
  test('all post links are present in the DOM', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.blog-card', { timeout: 10000 });
    const count = await page.locator('.blog-card-link').count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('no pagination URLs exist', async ({ page }) => {
    const response = await page.goto('/page/2');
    if (response.status() === 200) {
      expect(page.url()).not.toContain('/page/2');
    }
  });
});
