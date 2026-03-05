import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';

let mountPoint: string;
let rawMountPoint: string;
let appName: string;
let appSourcePath: string;
let validationError: string | null;

Given('the installer helpers are loaded', async ({ installer }) => {
  expect(installer).toBeTruthy();
});

When('parsing hdiutil output:', async ({ installer }, docString: string) => {
  mountPoint = installer.parseMountPoint(docString);
});

When(
  'parsing hdiutil output with trailing tabs:',
  async ({ installer }, docString: string) => {
    rawMountPoint = installer.parseMountPointRaw(docString);
  },
);

Then(
  'the mount point should be {string}',
  async ({}, expected: string) => {
    expect(mountPoint).toBe(expected);
  },
);

Then(
  'the raw mount point should be {string}',
  async ({}, expected: string) => {
    expect(rawMountPoint).toBe(expected);
  },
);

Then('the mount point should be empty', async () => {
  expect(mountPoint).toBe('');
});

Given('the mount point is {string}', async ({}, value: string) => {
  mountPoint = value;
});

Given('the app name is {string}', async ({}, value: string) => {
  appName = value;
});

When('building the app source path', async ({ installer }) => {
  appSourcePath = installer.buildAppSourcePath(mountPoint, appName);
});

Then(
  'the app source path should be {string}',
  async ({}, expected: string) => {
    expect(appSourcePath).toBe(expected);
  },
);

When('validating the mount point', async ({ installer }) => {
  validationError = installer.validateMountPoint(mountPoint);
});

Then(
  'validation should fail with {string} error',
  async ({}, errorSubstring: string) => {
    expect(validationError).not.toBeNull();
    expect(validationError!.toLowerCase()).toContain(
      errorSubstring.toLowerCase(),
    );
  },
);
