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
    await addon.indexSongs(
      songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        artworkUrl: s.artworkUrl,
        duration: s.duration,
      })),
    );
  } catch {
  }
}

export async function removeSongs(ids: string[]): Promise<void> {
  const addon = loadAddon();
  if (!addon) return;

  try {
    await addon.removeSongs(ids);
  } catch {
  }
}

export async function removeAllSongs(): Promise<void> {
  const addon = loadAddon();
  if (!addon) return;

  try {
    await addon.removeAllSongs();
  } catch {
  }
}

export function isIndexingAvailable(): boolean {
  const addon = loadAddon();
  return addon?.isIndexingAvailable() ?? false;
}
