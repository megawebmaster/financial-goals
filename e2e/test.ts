import { expect, test as base } from 'playwright/test';

type Fixtures = {
  withFixture: (
    testName: string,
    example: () => Promise<void>,
  ) => Promise<void>;
};
type WorkerFixtures = {};

export { expect };

export const test = base.extend<Fixtures, WorkerFixtures>({
  withFixture: async ({ page }, use) => {
    await use(async (testName: string, example: () => Promise<void>) => {
      await page.goto(`/fixtures/setup/${testName}`);
      await example();
      await page.goto(`/fixtures/cleanup/${testName}`);
    });
  },
});
