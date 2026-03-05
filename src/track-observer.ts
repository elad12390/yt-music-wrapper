import { BrowserWindow, Notification } from 'electron';
import type { TrackInfo } from './types';

// Injected into page context via webFrame.executeJavaScript() in preload.
// Watches YTM's player bar DOM for track changes, sets MediaSession metadata
// for macOS Now Playing / Control Center integration, and stores track info
// on window.__ytmTrackInfo for the main process to poll.
export const TRACK_OBSERVER_SCRIPT = `
(function() {
  if (window.__trackObserverActive) return;
  window.__trackObserverActive = true;
  window.__ytmTrackInfo = null;

  let lastTitle = '';
  let lastArtist = '';

  function getTrackInfo() {
    const titleEl = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-player-bar')
      || document.querySelector('.title.ytmusic-player-bar');
    const artistEl = document.querySelector('yt-formatted-string.byline.style-scope.ytmusic-player-bar span a')
      || document.querySelector('.byline.ytmusic-player-bar');
    const imgEl = document.querySelector('#song-image img')
      || document.querySelector('.middle-controls .thumbnail img')
      || document.querySelector('img.style-scope.ytmusic-player-bar');
    const video = document.querySelector('video');

    if (!titleEl || !titleEl.textContent) return null;

    return {
      title: (titleEl.textContent || '').trim(),
      artist: (artistEl ? artistEl.textContent : '').trim(),
      artworkUrl: imgEl ? imgEl.src : '',
      duration: video ? video.duration || 0 : 0,
      currentTime: video ? video.currentTime || 0 : 0,
      isPaused: video ? video.paused : true,
    };
  }

  function updateMediaSession(info) {
    if (!info || !info.title || !navigator.mediaSession) return;
    try {
      var artwork = info.artworkUrl
        ? [{ src: info.artworkUrl, sizes: '226x226', type: 'image/jpeg' }]
        : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info.title,
        artist: info.artist,
        artwork: artwork,
      });
    } catch(e) {}
  }

  function poll() {
    var info = getTrackInfo();
    if (!info) return;

    var changed = info.title !== lastTitle || info.artist !== lastArtist;
    if (changed && info.title) {
      lastTitle = info.title;
      lastArtist = info.artist;
      updateMediaSession(info);
    }
    window.__ytmTrackInfo = info;
  }

  setInterval(poll, 1000);
  poll();
})();
`;

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastTrackKey = '';
let currentTrack: TrackInfo | null = null;

type TrackChangeHandler = (track: TrackInfo) => void;
type PlaybackChangeHandler = (track: TrackInfo) => void;

let onTrackChange: TrackChangeHandler | null = null;
let onPlaybackChange: PlaybackChangeHandler | null = null;
let lastPaused: boolean | null = null;

export function startTrackMonitor(
  win: BrowserWindow,
  handlers: {
    onTrackChange: TrackChangeHandler;
    onPlaybackChange: PlaybackChangeHandler;
  },
): void {
  onTrackChange = handlers.onTrackChange;
  onPlaybackChange = handlers.onPlaybackChange;

  pollInterval = setInterval(async () => {
    if (win.isDestroyed()) {
      stopTrackMonitor();
      return;
    }

    try {
      const raw = await win.webContents.executeJavaScript(
        'JSON.stringify(window.__ytmTrackInfo)',
      );
      if (!raw || raw === 'null') return;

      const info: TrackInfo = JSON.parse(raw);
      currentTrack = info;

      const trackKey = `${info.title}::${info.artist}`;
      if (trackKey !== lastTrackKey && info.title) {
        lastTrackKey = trackKey;
        onTrackChange?.(info);
      }

      if (lastPaused !== null && info.isPaused !== lastPaused) {
        onPlaybackChange?.(info);
      }
      lastPaused = info.isPaused;
    } catch {}
  }, 1000);
}

export function stopTrackMonitor(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export function getCurrentTrack(): TrackInfo | null {
  return currentTrack;
}

export function showTrackNotification(track: TrackInfo): void {
  if (!track.title) return;

  const n = new Notification({
    title: track.title,
    body: track.artist || 'Unknown artist',
    silent: true,
  });
  n.show();
}
