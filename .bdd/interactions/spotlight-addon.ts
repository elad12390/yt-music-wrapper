import * as path from 'path';

export interface SongInput {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  duration?: number;
}

interface SpotlightNativeAddon {
  indexSongs: (songs: SongInput[]) => Promise<void>;
  removeSongs: (ids: string[]) => Promise<void>;
  removeAllSongs: () => Promise<void>;
  isIndexingAvailable: () => boolean;
}

export class SpotlightAddon {
  private addon: SpotlightNativeAddon | null = null;
  private loadError: Error | null = null;

  load(): SpotlightNativeAddon {
    if (this.addon) return this.addon;
    if (this.loadError) throw this.loadError;

    try {
      const addonDir = path.resolve(
        __dirname,
        '..',
        '..',
        'native',
        'spotlight',
      );

      const arch = process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
      let addonPath: string;

      try {
        addonPath = require.resolve(`${addonDir}/spotlight.${arch}.node`);
      } catch {
        addonPath = require.resolve(`${addonDir}/spotlight.node`);
      }

      this.addon = require(addonPath) as SpotlightNativeAddon;
      return this.addon;
    } catch (err) {
      this.loadError = err instanceof Error ? err : new Error(String(err));
      throw this.loadError;
    }
  }

  get isLoaded(): boolean {
    try {
      this.load();
      return true;
    } catch {
      return false;
    }
  }

  async indexSongs(songs: SongInput[]): Promise<void> {
    return this.load().indexSongs(songs);
  }

  async removeSongs(ids: string[]): Promise<void> {
    return this.load().removeSongs(ids);
  }

  async removeAllSongs(): Promise<void> {
    return this.load().removeAllSongs();
  }

  isIndexingAvailable(): boolean {
    return this.load().isIndexingAvailable();
  }
}
