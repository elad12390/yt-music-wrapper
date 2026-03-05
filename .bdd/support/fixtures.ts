import { test as base, createBdd } from 'playwright-bdd';
import { SpotlightAddon } from '../interactions/spotlight-addon';

export const test = base.extend<{
  spotlight: SpotlightAddon;
}>({
  spotlight: async ({}, use) => {
    await use(new SpotlightAddon());
  },
});

export const { Given, When, Then, BeforeScenario, AfterScenario } =
  createBdd(test);
