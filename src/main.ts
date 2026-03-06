import {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  shell,
  session,
} from 'electron';
import * as path from 'path';
import { setupTray, destroyTray, updateTrayTrack } from './tray';
import {
  startTrackMonitor,
  stopTrackMonitor,
  getCurrentTrack,
  showTrackNotification,
} from './track-observer';
import { togglePip, updatePipTrack, destroyPipWindow } from './pip';
import { buildSleepTimerMenu } from './sleep-timer';
import { indexSongs, removeAllSongs } from './spotlight';

app.commandLine.appendSwitch(
  'disable-features',
  [
    'ThirdPartyCookieBlocking',
    'PartitionedCookies',
    'SameSiteByDefaultCookies',
    'CookiesWithoutSameSiteMustBeSecure',
  ].join(','),
);
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let notificationsEnabled = true;

const YT_MUSIC_URL = 'https://music.youtube.com';

function executeMediaAction(action: 'playPause' | 'next' | 'previous'): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const scripts: Record<string, string> = {
    playPause: `
      (() => {
        const video = document.querySelector('video');
        if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
      })();
    `,
    next: `
      (() => {
        const btn = document.querySelector('.next-button')
          || document.querySelector('[aria-label="Next"]')
          || document.querySelector('tp-yt-paper-icon-button.next-button');
        if (btn) btn.click();
      })();
    `,
    previous: `
      (() => {
        const btn = document.querySelector('.previous-button')
          || document.querySelector('[aria-label="Previous"]')
          || document.querySelector('tp-yt-paper-icon-button.previous-button');
        if (btn) btn.click();
      })();
    `,
  };

  mainWindow.webContents.executeJavaScript(scripts[action]).catch((err) => {
    console.warn(`Media action '${action}' failed:`, err);
  });
}

function executeLikeAction(action: 'like' | 'dislike'): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const selectors: Record<string, string> = {
    like: `
      (() => {
        const btn = document.querySelector('#like-button-renderer yt-button-shape button')
          || document.querySelector('.like.ytmusic-like-button-renderer button')
          || document.querySelector('[aria-label="Like"]');
        if (btn) btn.click();
      })();
    `,
    dislike: `
      (() => {
        const btn = document.querySelector('#dislike-button-renderer yt-button-shape button')
          || document.querySelector('.dislike.ytmusic-like-button-renderer button')
          || document.querySelector('[aria-label="Dislike"]');
        if (btn) btn.click();
      })();
    `,
  };

  mainWindow.webContents.executeJavaScript(selectors[action]).catch((err) => {
    console.warn(`Like action '${action}' failed:`, err);
  });
}

function executeVolumeAction(direction: 'up' | 'down'): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const step = direction === 'up' ? 5 : -5;
  mainWindow.webContents
    .executeJavaScript(
      `(() => {
        const video = document.querySelector('video');
        if (video) {
          video.volume = Math.max(0, Math.min(1, video.volume + ${step / 100}));
        }
      })();`,
    )
    .catch((err) => {
      console.warn('Volume action failed:', err);
    });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes('accounts.google.com') ||
      url.includes('youtube.com') ||
      url.includes('google.com/signin') ||
      url.includes('myaccount.google.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
          },
        },
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-redirect', (event) => {
    const url = new URL(event.url);
    if (url.hostname.endsWith('youtube.com') && url.pathname === '/premium') {
      event.preventDefault();
      mainWindow?.loadURL(
        'https://accounts.google.com/ServiceLogin?ltmpl=music&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26next%3Dhttps%253A%252F%252Fmusic.youtube.com%252F',
      );
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) return;

    startTrackMonitor(mainWindow, {
      onTrackChange: (track) => {
        if (notificationsEnabled) {
          showTrackNotification(track);
        }
        updatePipTrack(track);
        updateTrayTrack();

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents
            .executeJavaScript('location.href')
            .then((href: string) => {
              try {
                const url = new URL(href);
                const videoId = url.searchParams.get('v');
                if (videoId && track.title) {
                  indexSongs([
                    {
                      id: videoId,
                      title: track.title,
                      artist: track.artist || 'Unknown',
                      album: '',
                      artworkUrl: track.artworkUrl || undefined,
                      duration: track.duration || undefined,
                    },
                  ]);
                }
              } catch (err) {
                console.warn('Spotlight indexing failed:', err);
              }
            })
            .catch((err) => {
              console.warn('Failed to get page URL for Spotlight:', err);
            });
        }
      },
      onPlaybackChange: (track) => {
        updatePipTrack(track);
        updateTrayTrack();
      },
    });
  });

  mainWindow.loadURL(YT_MUSIC_URL);
}

function buildAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Clear Session & Reload',
          click: async () => {
            await session.defaultSession.clearStorageData();
            await session.defaultSession.clearCache();
            mainWindow?.loadURL(YT_MUSIC_URL);
          },
        },
      ],
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => executeMediaAction('playPause'),
        },
        {
          label: 'Next Track',
          accelerator: 'CmdOrCtrl+Right',
          click: () => executeMediaAction('next'),
        },
        {
          label: 'Previous Track',
          accelerator: 'CmdOrCtrl+Left',
          click: () => executeMediaAction('previous'),
        },
        { type: 'separator' },
        {
          label: 'Like',
          accelerator: 'CmdOrCtrl+Shift+Down',
          click: () => executeLikeAction('like'),
        },
        {
          label: 'Dislike',
          accelerator: 'CmdOrCtrl+Shift+Up',
          click: () => executeLikeAction('dislike'),
        },
        { type: 'separator' },
        {
          label: 'Volume Up',
          accelerator: 'CmdOrCtrl+Up',
          click: () => executeVolumeAction('up'),
        },
        {
          label: 'Volume Down',
          accelerator: 'CmdOrCtrl+Down',
          click: () => executeVolumeAction('down'),
        },
        { type: 'separator' },
        {
          label: 'Mini Player',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            if (mainWindow) {
              togglePip(executeMediaAction, getCurrentTrack());
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Notifications',
          type: 'checkbox',
          checked: notificationsEnabled,
          click: (item) => {
            notificationsEnabled = item.checked;
          },
        },
        { type: 'separator' },
        buildSleepTimerMenu(() => executeMediaAction('playPause')),
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function registerMediaKeys(): void {
  globalShortcut.register('MediaPlayPause', () =>
    executeMediaAction('playPause'),
  );
  globalShortcut.register('MediaNextTrack', () => executeMediaAction('next'));
  globalShortcut.register('MediaPreviousTrack', () =>
    executeMediaAction('previous'),
  );
}

const ALLOWED_PERMISSIONS = [
  'media',
  'mediaKeySystem',
  'notifications',
  'clipboard-read',
  'clipboard-write',
];

let pendingDeepLinkUrl: string | null = null;

function handleDeepLink(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'ytmusic:') return;

    const songId = parsed.searchParams.get('id');
    if (parsed.hostname === 'play' && songId && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.loadURL(
        `https://music.youtube.com/watch?v=${encodeURIComponent(songId)}`,
      );
    }
  } catch (err) {
    console.warn('Deep link handling failed:', err);
  }
}

app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      handleDeepLink(url);
    } else {
      pendingDeepLinkUrl = url;
    }
  });
});

app.setAsDefaultProtocolClient('ytmusic');

function setupUserAgent(): void {
  const electronUA = session.defaultSession.getUserAgent();
  const cleanUA = electronUA
    .replace(/\s+Electron\/[\w.]+/, '')
    .replace(/\s+yt-music-wrapper\/[\w.]+/, '');
  app.userAgentFallback = cleanUA;
}

function setupRequestInterception(): void {
  const chromeVersion = process.versions.chrome;
  const chromeMajor = chromeVersion.split('.')[0];
  const spoofedClientHints: Record<string, string> = {
    'Sec-CH-UA': `"Chromium";v="${chromeMajor}", "Google Chrome";v="${chromeMajor}", "Not-A.Brand";v="24"`,
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"macOS"',
    'Sec-CH-UA-Full-Version-List': `"Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}", "Not-A.Brand";v="24.0.0.0"`,
  };

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = details.requestHeaders;

    for (const [key, value] of Object.entries(spoofedClientHints)) {
      headers[key] = value;
    }

    callback({ cancel: false, requestHeaders: headers });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders;
    if (!headers) {
      callback({ cancel: false });
      return;
    }

    try {
      const { hostname } = new URL(details.url);
      const isYouTube =
        hostname === 'music.youtube.com' ||
        hostname.endsWith('.youtube.com') ||
        hostname.endsWith('.ytimg.com') ||
        hostname.endsWith('.googlevideo.com');

      if (isYouTube) {
        delete headers['content-security-policy'];
        delete headers['Content-Security-Policy'];
        delete headers['content-security-policy-report-only'];
        delete headers['Content-Security-Policy-Report-Only'];
      }
    } catch (err) {
      console.warn('CSP header stripping failed:', err);
    }

    callback({ cancel: false, responseHeaders: headers });
  });
}

function setupPermissions(): void {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(ALLOWED_PERMISSIONS.includes(permission));
    },
  );
}

function setupNavigationGuards(): void {
  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (_navEvent, navUrl) => {
      if (
        contents !== mainWindow?.webContents &&
        navUrl.includes('music.youtube.com')
      ) {
        const popupWindow = BrowserWindow.fromWebContents(contents);
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.close();
        }
      }
    });
  });
}

app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.dock?.setIcon(path.join(__dirname, '..', 'assets', 'icon.png'));
  }

  setupUserAgent();
  setupRequestInterception();
  setupPermissions();
  setupNavigationGuards();
  buildAppMenu();
  createWindow();
  registerMediaKeys();

  if (mainWindow) {
    setupTray(mainWindow, executeMediaAction);
  }

  if (pendingDeepLinkUrl) {
    handleDeepLink(pendingDeepLinkUrl);
    pendingDeepLinkUrl = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopTrackMonitor();
  destroyPipWindow();
  destroyTray();
  globalShortcut.unregisterAll();
  removeAllSongs().catch((err) => {
    console.warn('Failed to clear Spotlight index on quit:', err);
  });
});
