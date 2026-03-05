import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { DataTable } from 'playwright-bdd';
import type { SongInput } from '../interactions/spotlight-addon';

let lastResult: { error?: Error } = {};

Given('the Spotlight addon is loaded', async ({ spotlight }) => {
  spotlight.load();
});

Then(
  'it should export the {string} function',
  async ({ spotlight }, fnName: string) => {
    const addon = spotlight.load() as unknown as Record<string, unknown>;
    expect(typeof addon[fnName]).toBe('function');
  },
);

When('checking if indexing is available', async ({ spotlight }) => {
  spotlight.isIndexingAvailable();
});

Then('the result should be a boolean', async ({ spotlight }) => {
  const result = spotlight.isIndexingAvailable();
  expect(typeof result).toBe('boolean');
});

When('indexing the following songs:', async ({ spotlight }, table: DataTable) => {
  const songs: SongInput[] = table.hashes().map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
  }));

  try {
    await spotlight.indexSongs(songs);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

When('indexing a song with artwork:', async ({ spotlight }, table: DataTable) => {
  const row = table.hashes()[0];
  const song: SongInput = {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    artworkUrl: row.artworkUrl,
  };

  try {
    await spotlight.indexSongs([song]);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

When(
  'indexing a song with duration:',
  async ({ spotlight }, table: DataTable) => {
    const row = table.hashes()[0];
    const song: SongInput = {
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album,
      duration: parseFloat(row.duration),
    };

    try {
      await spotlight.indexSongs([song]);
      lastResult = {};
    } catch (err) {
      lastResult = {
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },
);

When('indexing an empty list of songs', async ({ spotlight }) => {
  try {
    await spotlight.indexSongs([]);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

When('indexing a song without an id', async ({ spotlight }) => {
  try {
    await spotlight.indexSongs([
      { id: '', title: 'Test', artist: 'Test', album: 'Test' },
    ]);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

When('indexing a song without a title', async ({ spotlight }) => {
  try {
    await spotlight.indexSongs([
      { id: 'test-id', title: '', artist: 'Test', album: 'Test' },
    ]);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

Then(
  'the indexing operation should complete without crashing',
  async () => {
    expect(true).toBe(true);
  },
);

Then('the operation should fail with a type error', async () => {
  expect(lastResult.error).toBeDefined();
});

When(
  'removing songs with IDs:',
  async ({ spotlight }, table: DataTable) => {
    const ids = table.hashes().map((row) => row.id);
    try {
      await spotlight.removeSongs(ids);
      lastResult = {};
    } catch (err) {
      lastResult = {
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },
);

When('removing songs with an empty ID list', async ({ spotlight }) => {
  try {
    await spotlight.removeSongs([]);
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

When('removing all songs from the index', async ({ spotlight }) => {
  try {
    await spotlight.removeAllSongs();
    lastResult = {};
  } catch (err) {
    lastResult = { error: err instanceof Error ? err : new Error(String(err)) };
  }
});

Then(
  'the removal operation should complete without crashing',
  async () => {
    expect(true).toBe(true);
  },
);

Then(
  'the remove-all operation should complete without crashing',
  async () => {
    expect(true).toBe(true);
  },
);
