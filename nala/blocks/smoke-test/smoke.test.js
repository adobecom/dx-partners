import { test } from '@playwright/test';
import SmokeTest from './smoke.page.js';
import SmokeSpec from './smoke.spec.js';

let smokeTest;

const { features } = SmokeSpec;

test.describe('Validate Partner Directory pages', () => {
  test.beforeEach(async ({ page, browserName, baseURL, context }) => {
    smokeTest = new SmokeTest(page);
    if (!baseURL.includes('partners.stage.adobe.com')) {
          await context.setExtraHTTPHeaders({ authorization: `token ${process.env.MILO_AEM_API_KEY}` });
        }
        if (browserName === 'chromium' && !baseURL.includes('partners.stage.adobe.com')) {
          await page.route('https://www.adobe.com/chimera-api/**', async (route, request) => {
            const newUrl = request.url().replace(
              'https://www.adobe.com/chimera-api',
              'https://14257-chimera.adobeioruntime.net/api/v1/web/chimera-0.0.1',
            );
            route.continue({ url: newUrl });
          });
        }
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    const { path } = features[0];
    await test.step('Go to Partner Directory, verify status code and if gnav is visible', async () => {
      await smokeTest.verifyStatusCode(baseURL);
      await smokeTest.verifyIfGnavIsPresent();
      await smokeTest.verifyIfFooterIsPresent();
    });

    await test.step('Go to Partner Directory Join page and verify status code and if gnav is visible', async () => {
      await smokeTest.verifyStatusCode(`${baseURL}${path}`);
      await smokeTest.verifyIfGnavIsPresent();
      await smokeTest.verifyIfFooterIsPresent();
    });
  });

  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    const { data } = features[1];

    await test.step('Go to Partner Directory page and verify the links', async () => {
      await page.goto(baseURL);
      await smokeTest.verifyPartnerDirectoryLinks(data, baseURL);
    });
  });

  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    const { data, path } = features[2];

    await test.step('Go to Partner Directory Join page and verify the links', async () => {
      await page.goto(`${baseURL}${path}`);
      await smokeTest.verifyPartnerDirectoryJoinLinks(data, baseURL);
    });
  });
});
