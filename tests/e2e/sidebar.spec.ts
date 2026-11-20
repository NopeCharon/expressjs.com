import { test, expect } from '@playwright/test';
import enStrings from '../../src/i18n/ui/en.json' with { type: 'json' };

/**
 * Sidebar E2E Tests
 *
 * Pages of the default version are also served without the version in the URL
 * (e.g. `/en/guide/routing/` is a copy of `/en/5x/guide/routing/`), which is where
 * old links land. The sidebar should treat both URLs as the same page.
 */
const pages = [
  {
    url: '/en/guide/routing/',
    versionedUrl: '/en/5x/guide/routing/',
    label: enStrings.menu.aria.routing,
    olderVersionUrl: '/en/4x/guide/routing/',
  },
  {
    url: '/en/api/response/',
    versionedUrl: '/en/5x/api/response/',
    label: enStrings.menu.aria.response,
    olderVersionUrl: '/en/4x/api/response/',
  },
];

test.describe('Sidebar', () => {
  for (const { url, versionedUrl, label, olderVersionUrl } of pages) {
    test.describe(url, () => {
      test('should mark the current page as active, like its versioned URL', async ({ page }) => {
        for (const pageUrl of [url, versionedUrl]) {
          await page.goto(pageUrl);

          const currentLink = page.getByTestId('sidebar').locator('[aria-current="page"]');
          await expect(currentLink).toHaveAttribute('aria-label', label);
          await expect(currentLink).toBeVisible();
        }
      });

      test('should switch to the same page in another version', async ({ page }) => {
        await page.goto(url);

        // Every versioned section has its own switcher; use the one next to the current page.
        const sidebar = page.getByTestId('sidebar');
        const switcher = sidebar
          .locator('[data-parent-id]', { has: page.locator('[aria-current="page"]') })
          .locator('[data-version-switcher]');
        await switcher.locator('[data-select-button]').click();
        await switcher.locator('[data-select-option][data-value="4x"]').click();

        await expect(page).toHaveURL(olderVersionUrl);
      });
    });
  }
});
