import { test as base, createBdd } from 'playwright-bdd';
import { SpotlightAddon } from '../interactions/spotlight-addon';
import { InstallerHelpers } from '../interactions/installer-helpers';

export const test = base.extend<{
  spotlight: SpotlightAddon;
  installer: InstallerHelpers;
}>({
  spotlight: async ({}, use) => {
    await use(new SpotlightAddon());
  },
  installer: async ({}, use) => {
    await use(new InstallerHelpers());
  },
});

export const { Given, When, Then, BeforeScenario, AfterScenario } =
  createBdd(test);
