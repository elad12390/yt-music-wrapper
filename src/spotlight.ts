import * as path from 'path';

interface SongInput {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  duration?: number;
}

interface SpotlightNative {
  indexSongs: (songs: SongInput[]) => Promise<void>;
  removeSongs: (ids: string[]) => Promise<void>;
  removeAllSongs: () => Promise<void>;
  isIndexingAvailable: () => boolean;
}

let native: SpotlightNative | null = null;
let loadFailed = false;

function loadAddon(): SpotlightNative | null {
  if (native) return native;
  if (loadFailed) return null;

  try {
    const addonDir = path.join(__dirname, '..', 'native', 'spotlight');
    const arch = process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';

    try {
      native = require(path.join(addonDir, `spotlight.${arch}.node`));
    } catch {
      native = require(path.join(addonDir, 'spotlight.node'));
    }

    return native;
  } catch {
    loadFailed = true;
    console.warn('Spotlight addon not available — indexing disabled');
    return null;
  }
}

export async function indexSongs(
  songs: { id: string; title: string; artist: string; album: string; artworkUrl?: string; duration?: number }[],
): Promise<void> {
  const addon = loadAddon();
  if (!addon) return;

  try {
    await addon.indexSongs(songs);
  } catch (err) {
    console.warn('Spotlight indexSongs failed:', err);
  }
}

export async function removeSongs(ids: string[]): Promise<void> {
  const addon = loadAddon();
  if (!addon) return;

  try {
    await addon.removeSongs(ids);
  } catch (err) {
    console.warn('Spotlight removeSongs failed:', err);
  }
}

export async function removeAllSongs(): Promise<void> {
  const addon = loadAddon();
  if (!addon) return;

  try {
    await addon.removeAllSongs();
  } catch (err) {
    console.warn('Spotlight removeAllSongs failed:', err);
  }
}

export function isIndexingAvailable(): boolean {
  const addon = loadAddon();
  return addon?.isIndexingAvailable() ?? false;
}
