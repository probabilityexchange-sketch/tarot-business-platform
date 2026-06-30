import { test, expect } from "@playwright/test";

const CANONICAL_BASE = "https://kalimeister.com";
const EXPECTED_OG_IMAGE = `${CANONICAL_BASE}/images/kali-meister.jpg`;

test.describe("Technical SEO Validation", () => {
  test("/readings/tarot-reading/atlanta-ga has valid JSON-LD schema", async ({ page }) => {
    await page.goto("/readings/tarot-reading/atlanta-ga");

    const ldJsonScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(ldJsonScripts.length).toBeGreaterThanOrEqual(1);

    const parsed: Record<string, unknown>[] = [];
    for (const script of ldJsonScripts) {
      const content = await script.textContent();
      expect(content).toBeTruthy();
      parsed.push(JSON.parse(content!));
    }

    const types = parsed.map((s) => s["@type"]);
    expect(types).toContain("Service");
  });

  test("/readings/tarot-reading/atlanta-ga has canonical tag", async ({ page }) => {
    await page.goto("/readings/tarot-reading/atlanta-ga");

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);

    const href = await canonical.getAttribute("href");
    expect(href).toBe(`${CANONICAL_BASE}/readings/tarot-reading/atlanta-ga`);
  });

  test("/readings/tarot-reading/atlanta-ga has OpenGraph metadata", async ({ page }) => {
    await page.goto("/readings/tarot-reading/atlanta-ga");

    // og:title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    const ogTitleContent = await ogTitle.getAttribute("content");
    expect(ogTitleContent).toBeTruthy();
    expect(ogTitleContent).toContain("Atlanta");

    // og:description
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveCount(1);
    const ogDescContent = await ogDesc.getAttribute("content");
    expect(ogDescContent).toBeTruthy();

    // og:url
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveCount(1);
    const ogUrlContent = await ogUrl.getAttribute("content");
    expect(ogUrlContent).toBe(`${CANONICAL_BASE}/readings/tarot-reading/atlanta-ga`);

    // og:locale
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveCount(1);
    const ogLocaleContent = await ogLocale.getAttribute("content");
    expect(ogLocaleContent).toBe("en_US");

    // og:site_name
    const ogSiteName = page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveCount(1);
    const ogSiteNameContent = await ogSiteName.getAttribute("content");
    expect(ogSiteNameContent).toBe("Kali Meister");

    // og:image
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
    const ogImageContent = await ogImage.getAttribute("content");
    expect(ogImageContent).toBe(EXPECTED_OG_IMAGE);
  });

  test("/readings/tarot-reading/atlanta-ga has Twitter Card metadata", async ({ page }) => {
    await page.goto("/readings/tarot-reading/atlanta-ga");

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveCount(1);
    const twitterCardContent = await twitterCard.getAttribute("content");
    expect(twitterCardContent).toBe("summary_large_image");

    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveCount(1);
    expect(await twitterTitle.getAttribute("content")).toBeTruthy();

    const twitterImage = page.locator('meta[name="twitter:image"]');
    await expect(twitterImage).toHaveCount(1);
    expect(await twitterImage.getAttribute("content")).toBe(EXPECTED_OG_IMAGE);
  });

  test("robots.txt resolves and contains correct rules", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);

    const body = await response!.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api");
    expect(body).toContain("Sitemap: https://kalimeister.com/sitemap.xml");
  });

  test("sitemap.xml resolves", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);

    const headers = response!.headers();
    const contentType = headers["content-type"];
    expect(contentType).toMatch(/xml/);
  });
});
