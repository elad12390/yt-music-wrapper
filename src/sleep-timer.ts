import type { MenuItemConstructorOptions } from 'electron';

let timer: ReturnType<typeof setTimeout> | null = null;
let endsAt: number | null = null;
let onExpireCallback: (() => void) | null = null;

export function startSleepTimer(minutes: number, onExpire: () => void): void {
  cancelSleepTimer();
  onExpireCallback = onExpire;
  endsAt = Date.now() + minutes * 60 * 1000;

  timer = setTimeout(() => {
    const cb = onExpireCallback;
    cancelSleepTimer();
    cb?.();
  }, minutes * 60 * 1000);
}

export function cancelSleepTimer(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  endsAt = null;
  onExpireCallback = null;
}

export function getSleepTimerRemaining(): number | null {
  if (!endsAt) return null;
  const remaining = Math.max(0, endsAt - Date.now());
  return remaining > 0 ? Math.ceil(remaining / 60000) : null;
}

export function isSleepTimerActive(): boolean {
  return endsAt !== null;
}

export function buildSleepTimerMenu(
  pauseCallback: () => void,
): MenuItemConstructorOptions {
  const presets = [15, 30, 45, 60, 90, 120];

  return {
    label: isSleepTimerActive()
      ? `Sleep Timer (${getSleepTimerRemaining()}m left)`
      : 'Sleep Timer',
    submenu: [
      ...presets.map((mins) => ({
        label: `${mins} minutes`,
        click: () => startSleepTimer(mins, pauseCallback),
      })),
      { type: 'separator' as const },
      {
        label: 'Cancel Timer',
        enabled: isSleepTimerActive(),
        click: () => cancelSleepTimer(),
      },
    ],
  };
}
