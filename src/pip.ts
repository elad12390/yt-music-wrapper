import { BrowserWindow } from 'electron';
import * as path from 'path';
import type { TrackInfo } from './types';


let pipWindow: BrowserWindow | null = null;

export function createPipWindow(): BrowserWindow {
  if (pipWindow && !pipWindow.isDestroyed()) {
    pipWindow.focus();
    return pipWindow;
  }

  pipWindow = new BrowserWindow({
    width: 320,
    height: 100,
    minWidth: 280,
    minHeight: 80,
    maxHeight: 100,
    resizable: true,
    alwaysOnTop: true,
    frame: false,
    transparent: false,
    skipTaskbar: true,
    hasShadow: true,
    vibrancy: 'popover',
    roundedCorners: true,
    show: false,
    parent: undefined,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  pipWindow.loadFile(path.join(__dirname, '..', 'assets', 'pip.html'));

  pipWindow.once('ready-to-show', () => {
    pipWindow?.show();
  });

  pipWindow.on('closed', () => {
    pipWindow = null;
  });

  return pipWindow;
}

export function updatePipTrack(track: TrackInfo): void {
  if (!pipWindow || pipWindow.isDestroyed()) return;

  pipWindow.webContents
    .executeJavaScript(
      `window.__updateTrack && window.__updateTrack(${JSON.stringify(track)})`,
    )
    .catch((err) => {
      console.warn('PiP track update failed:', err);
    });
}

export function destroyPipWindow(): void {
  if (pipWindow && !pipWindow.isDestroyed()) {
    pipWindow.close();
    pipWindow = null;
  }
}

export function isPipOpen(): boolean {
  return pipWindow !== null && !pipWindow.isDestroyed();
}

export function togglePip(
  executeMediaAction: (action: 'playPause' | 'next' | 'previous') => void,
  currentTrack: TrackInfo | null,
): void {
  if (isPipOpen()) {
    destroyPipWindow();
    return;
  }

  const win = createPipWindow();

  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === ' ') executeMediaAction('playPause');
    if (input.key === 'ArrowRight') executeMediaAction('next');
    if (input.key === 'ArrowLeft') executeMediaAction('previous');
    if (input.key === 'Escape') destroyPipWindow();
  });

  if (currentTrack) {
    win.once('ready-to-show', () => {
      updatePipTrack(currentTrack);
    });
  }
}
