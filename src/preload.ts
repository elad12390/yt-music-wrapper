import { webFrame } from 'electron';
import { TRACK_OBSERVER_SCRIPT } from './track-observer';

const STEALTH_SCRIPT = `
(function() {
  if (window.__stealth_injected) return;
  window.__stealth_injected = true;

  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true,
  });

  window.chrome = {
    app: {
      isInstalled: false,
      InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
      RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
      getDetails: function() { return null; },
      getIsInstalled: function() { return false; },
      installState: function(cb) { if (cb) cb('not_installed'); },
      runningState: function() { return 'cannot_run'; },
    },
    runtime: {
      PlatformOs: { MAC: 'mac', WIN: 'win', ANDROID: 'android', CROS: 'cros', LINUX: 'linux', OPENBSD: 'openbsd' },
      PlatformArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64', MIPS: 'mips', MIPS64: 'mips64' },
      PlatformNaclArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64', MIPS: 'mips', MIPS64: 'mips64' },
      RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' },
      OnInstalledReason: { INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update' },
      OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
      connect: function() { return { onDisconnect: { addListener: function() {} }, onMessage: { addListener: function() {} }, postMessage: function() {}, disconnect: function() {} }; },
      sendMessage: function() {},
      id: undefined,
    },
    webstore: {
      onInstallStageChanged: { addListener: function() {} },
      onDownloadProgress: { addListener: function() {} },
    },
    csi: function() { return {}; },
    loadTimes: function() { return {}; },
  };

  const originalQuery = window.navigator.permissions.query.bind(window.navigator.permissions);
  window.navigator.permissions.query = function(desc) {
    if (desc && desc.name === 'notifications') {
      return Promise.resolve({ state: 'prompt', onchange: null });
    }
    return originalQuery(desc);
  };

  Object.defineProperty(navigator, 'plugins', {
    get: () => {
      const arr = [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
      ];
      arr.item = (i) => arr[i] || null;
      arr.namedItem = (name) => arr.find(p => p.name === name) || null;
      arr.refresh = () => {};
      return arr;
    },
    configurable: true,
  });

  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
    configurable: true,
  });

  // Spoof navigator.userAgentData — the JS API for Client Hints
  // Without this, Google can read brands and see "Electron"
  const chromeVersion = navigator.userAgent.match(/Chrome\\/(\\d+)/)?.[1] || '134';
  const fullChromeVersion = navigator.userAgent.match(/Chrome\\/([\\d.]+)/)?.[1] || '134.0.0.0';
  const fakeBrands = [
    { brand: 'Chromium', version: chromeVersion },
    { brand: 'Google Chrome', version: chromeVersion },
    { brand: 'Not-A.Brand', version: '24' },
  ];
  const fakeFullBrands = [
    { brand: 'Chromium', version: fullChromeVersion },
    { brand: 'Google Chrome', version: fullChromeVersion },
    { brand: 'Not-A.Brand', version: '24.0.0.0' },
  ];

  const fakeUserAgentData = {
    brands: fakeBrands,
    mobile: false,
    platform: 'macOS',
    getHighEntropyValues: function(hints) {
      var isArm = navigator.userAgent.includes('ARM') || !navigator.userAgent.includes('Intel');
      return Promise.resolve({
        brands: fakeBrands,
        fullVersionList: fakeFullBrands,
        mobile: false,
        model: '',
        platform: 'macOS',
        platformVersion: '15.3.0',
        architecture: isArm ? 'arm' : 'x86',
        bitness: '64',
        uaFullVersion: fullChromeVersion,
        wow64: false,
      });
    },
    toJSON: function() {
      return { brands: fakeBrands, mobile: false, platform: 'macOS' };
    },
  };

  Object.defineProperty(navigator, 'userAgentData', {
    get: () => fakeUserAgentData,
    configurable: true,
  });

  if (typeof Notification !== 'undefined') {
    Object.defineProperty(Notification, 'permission', {
      get: () => 'default',
      configurable: true,
    });
  }
})();
`;

webFrame.executeJavaScript(STEALTH_SCRIPT).catch((err) => {
  console.warn('Stealth script injection failed:', err);
});
webFrame.executeJavaScript(TRACK_OBSERVER_SCRIPT).catch((err) => {
  console.warn('Track observer injection failed:', err);
});
