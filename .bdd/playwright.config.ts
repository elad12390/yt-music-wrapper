import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

const testDir = defineBddConfig({
  features: path.join(projectRoot, '.bdd/features/**/*.feature'),
  steps: [
    path.join(projectRoot, '.bdd/steps/*.ts'),
    path.join(projectRoot, '.bdd/support/*.ts'),
  ],
  outputDir: path.join(projectRoot, '.bdd/.features-gen'),
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {},
});
