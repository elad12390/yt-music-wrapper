import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import * as path from 'path';
import { getCurrentTrack } from './track-observer';
import { togglePip, isPipOpen } from './pip';
import { buildSleepTimerMenu } from './sleep-timer';

let tray: Tray | null = null;

type MediaAction = 'playPause' | 'next' | 'previous';

let cachedWindow: BrowserWindow | null = null;
let cachedExecuteMediaAction: ((action: MediaAction) => void) | null = null;

export function setupTray(
  window: BrowserWindow,
  executeMediaAction: (action: MediaAction) => void,
): void {
  cachedWindow = window;
  cachedExecuteMediaAction = executeMediaAction;

  const iconPath = path.join(__dirname, '..', 'assets', 'iconTemplate.png');
  let icon: Electron.NativeImage;

  try {
    icon = nativeImage.createFromPath(iconPath);
    icon = icon.resize({ width: 16, height: 16 });
  } catch {
    icon = nativeImage.createEmpty();
  }

  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('YT Music');

  rebuildTrayMenu(window, executeMediaAction);

  tray.on('click', () => {
    window.show();
  });
}

export function rebuildTrayMenu(
  window: BrowserWindow,
  executeMediaAction: (action: MediaAction) => void,
): void {
  if (!tray) return;

  const track = getCurrentTrack();
  const trackLabel = track?.title
    ? `${track.title} — ${track.artist}`
    : 'No track playing';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: trackLabel.length > 40 ? trackLabel.slice(0, 37) + '...' : trackLabel,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Play / Pause',
      click: () => executeMediaAction('playPause'),
    },
    {
      label: 'Next',
      click: () => executeMediaAction('next'),
    },
    {
      label: 'Previous',
      click: () => executeMediaAction('previous'),
    },
    { type: 'separator' },
    {
      label: isPipOpen() ? 'Close Mini Player' : 'Mini Player',
      click: () => togglePip(executeMediaAction, getCurrentTrack()),
    },
    buildSleepTimerMenu(() => executeMediaAction('playPause')),
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => window.show(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);

  if (track?.title) {
    tray.setToolTip(`${track.title} — ${track.artist}`);
  }
}

export function updateTrayTrack(): void {
  if (cachedWindow && cachedExecuteMediaAction) {
    rebuildTrayMenu(cachedWindow, cachedExecuteMediaAction);
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
