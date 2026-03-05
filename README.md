# YT Music Wrapper

Minimal Electron desktop wrapper for YouTube Music (`music.youtube.com`).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build & Package

```bash
npm run build        # Compile TypeScript
npm run dist         # Package as macOS .dmg
```

## Features

- Native macOS window with hidden title bar
- Google login with session persistence (cookies survive restarts)
- DRM/Widevine support (Electron's Chromium handles this natively)
- Media key support (Play/Pause, Next, Previous)
- System tray with playback controls
- Window hides on close, stays in dock/tray (Cmd+Q to quit)
- Full Edit menu (Cmd+C, Cmd+V, etc.)
