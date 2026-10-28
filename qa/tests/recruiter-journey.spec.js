const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__errors, 'No uncaught JavaScript exceptions').toEqual([]);
});

async function openResource(page) {
  await page.goto('/');
  await page.getByRole('button', { name: '现在 · AI', exact: true }).click();
  await page.locator('#stageNext').click();
  await expect(page.locator('#stagePosition')).toHaveText('2 / 6');
  await page.locator('#stageTrack a[data-pos="0"]').click();
  await expect(page).toHaveURL(/#project\/resource-workshop$/);
}

test('return from a zoomed project restores its folder and leaves no stale dialog', async ({ page }) => {
  await openResource(page);
  await page.reload();
  await page.locator('#detail-content a[data-team-ai-zoom]').first().click();
  await expect(page.locator('#teamAiZoom')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stagePosition')).toHaveText('2 / 6');
  await expect(page.locator('#teamAiZoom')).not.toBeVisible();
  await page.locator('#stageClose').click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '现在 · AI', exact: true })).toBeFocused();
});

test('language round trip remembers expanded content and reading position', async ({ page }) => {
  await page.goto('/#project/paige');
  await page.locator('#pg-log > summary').click();
  await page.locator('#pg-log > summary').scrollIntoViewIfNeeded();
  const original = await page.locator('#pg-log').evaluate(el => el.getBoundingClientRect().top);
  await page.locator('#langBtn').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  await page.locator('#langBtn').click();
  await expect(page.locator('#pg-log')).toHaveAttribute('open', '');
  await expect.poll(async () => Math.abs(await page.locator('#pg-log').evaluate(el => el.getBoundingClientRect().top) - original)).toBeLessThan(4);
});

test('related article back restores the previous article rather than home', async ({ page }) => {
  await page.goto('/#project/paige');
  const link = page.getByRole('link', { name: '指标篇', exact: true });
  await link.scrollIntoViewIfNeeded();
  const before = await link.evaluate(el => el.getBoundingClientRect().top);
  await link.click();
  await expect(page).toHaveURL(/#project\/metrics$/);
  await page.locator('#detailBack').click();
  await expect(page).toHaveURL(/#project\/paige$/);
  await expect.poll(async () => Math.abs(await link.evaluate(el => el.getBoundingClientRect().top) - before)).toBeLessThan(4);
});

test('related links support a modified click and a real new tab', async ({ page, context }) => {
  await page.goto('/#project/paige');
  const link = page.getByRole('link', { name: '指标篇', exact: true });
  await expect(link).toHaveAttribute('href', '#project/metrics');
  const newTabPromise = context.waitForEvent('page');
  await link.click({ modifiers: ['ControlOrMeta'] });
  const newTab = await newTabPromise;
  await expect(newTab).toHaveURL(/#project\/metrics$/);
  await expect(newTab.locator('#page-detail')).toHaveClass(/active/);
  await expect(page).toHaveURL(/#project\/paige$/);
  await newTab.close();
});

test('fresh deep links and reloads have a safe return to work', async ({ page }) => {
  await page.goto('/#project/resource-workshop');
  await page.reload();
  await expect(page.locator('#detailBack')).toHaveText('← 返回作品');
  await page.locator('#detailBack').click();
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await expect(page.locator('#work')).toBeInViewport();
  await expect(page.locator('#work')).toBeFocused();
});

test('project entry works on the first click when separate JS requests are unavailable', async ({ page }) => {
  const requests = [];
  await page.route('**/assets/*.js', route => { requests.push(route.request().url()); return route.abort(); });
  await page.goto('/');
  await page.getByRole('button', { name: '现在 · AI', exact: true }).click();
  await expect(page.locator('#stage')).toBeVisible();
  await page.locator('#stageTrack a[data-pos="0"]').click();
  await expect(page.locator('#page-detail')).toHaveClass(/active/);
  expect(requests, 'Critical behavior no longer depends on secondary JS downloads').toEqual([]);
});

test('Paige starts with compressed posters and does not download video before play', async ({ page }) => {
  const mediaRequests = [], unrelatedImages = [];
  page.on('request', request => {
    if (/\.mp4(?:\?|$)/.test(request.url())) mediaRequests.push(request.url());
    if (request.url().includes('/optimized/images/human/')) unrelatedImages.push(request.url());
  });
  await page.goto('/#project/paige');
  const videos = page.locator('#detail-content video');
  await expect(videos).toHaveCount(3);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute('poster', /\/optimized\/.*\.webp$/);
    await expect(video).toHaveAttribute('preload', 'none');
    const box = await video.boundingBox();
    expect(Math.abs(box.width / box.height - 1.6), 'Poster keeps the original video aspect ratio').toBeLessThan(.02);
  }
  await videos.first().scrollIntoViewIfNeeded();
  await expect(videos.first()).not.toHaveAttribute('src');
  expect(mediaRequests).toEqual([]);
  expect(unrelatedImages, 'Direct project entry must not fetch hidden homepage photos').toEqual([]);
  // Verify deferred media is still reachable and usable when playback is requested.
  await page.locator('.detail-video-start').first().click();
  await expect.poll(() => videos.first().evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  expect(mediaRequests.length).toBeGreaterThan(0);
  await page.getByRole('link', { name: '谢松伦', exact: true }).click();
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await expect.poll(() => videos.first().evaluate(v => v.paused)).toBe(true);
});

test('keyboard preview closes with Escape and pages fit their viewport', async ({ page }) => {
  await page.goto('/');
  const folder = page.getByRole('button', { name: '现在 · AI', exact: true });
  await folder.press('Enter');
  await expect(page.locator('#stage')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#stage')).not.toBeVisible();
  await expect(folder).toBeFocused();
  for (const hash of ['home', 'project/paige', 'project/resource-workshop']) {
    await page.goto('/#' + hash);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
