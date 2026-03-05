# YT Music

A native macOS desktop app for [YouTube Music](https://music.youtube.com) — built with Electron for full DRM/Widevine support.

> **Requires YouTube Music Premium** for background playback and ad-free experience.

<!-- TODO: Add screenshot here -->
<!-- ![YT Music Screenshot](assets/screenshot.png) -->

## Features

- **Media keys** — Play/Pause, Next, Previous work globally
- **System tray** — Playback controls, current track info, always accessible
- **Picture-in-Picture** — Floating mini player (always on top)
- **Sleep timer** — 15/30/45/60/90/120 min presets
- **Track notifications** — Native macOS notifications on song change
- **Spotlight search** — Find played songs via macOS Spotlight (requires signed build)
- **Deep links** — `ytmusic://play?id=VIDEO_ID` opens directly to a song
- **Like/Dislike** — `Cmd+Shift+Up` / `Cmd+Shift+Down`
- **Volume** — `Cmd+Up` / `Cmd+Down`
- **Session persistence** — Cookies and login survive restarts
- **macOS native** — Standard titlebar, dock icon, hide-on-close behavior

## Install

### From Releases (recommended)

Download the latest `.dmg` from [Releases](https://github.com/elad12390/yt-music-wrapper/releases), open it, drag to Applications.

### From Source

**Prerequisites:** Node.js 20+, Rust toolchain, bun (optional, npm works too)

```bash
git clone https://github.com/elad12390/yt-music-wrapper.git
cd yt-music-wrapper
npm install
./scripts/install-hooks.sh

npm run build:all
npm run dev
```

## Development

```bash
npm run dev          # Build + launch Electron
npm run build        # Compile TypeScript only
npm run build:native # Compile Rust Spotlight addon
npm run build:all    # Both
npm run test:bdd     # Run BDD test suite
npm run dist         # Package as .dmg
```

### Project Structure

```
src/
├── main.ts            # Electron main process
├── preload.ts         # Stealth patches, track observer injection
├── track-observer.ts  # Polls YTM DOM for track changes
├── spotlight.ts       # Loads native Spotlight addon
├── pip.ts             # Picture-in-Picture window
├── tray.ts            # System tray
├── sleep-timer.ts     # Sleep timer logic
└── types.ts           # Shared types

native/spotlight/      # Rust addon (napi-rs + Core Spotlight)
├── src/lib.rs         # CSSearchableItem indexing
├── Cargo.toml
└── build.rs

.bdd/                  # BDD test suite (playwright-bdd)
├── features/          # Gherkin feature files
├── steps/             # Step definitions
└── interactions/      # Test helpers
```

### Releasing

The pre-push hook enforces version bump + changelog on every push to master. CI automatically builds and publishes a GitHub Release with DMGs.

```bash
npm run version:patch  # 1.0.0 → 1.0.1
# Edit CHANGELOG.md
git add -A && git commit -m "release: v1.0.1"
git push origin master
```

## Known Limitations

- **Google login** — Google's bot detection may block login inside Electron. If this happens, try logging in via the popup window or clearing cookies.
- **Spotlight** — Requires a code-signed build. The CI produces ad-hoc signed DMGs. Dev builds (`npm run dev`) won't index to Spotlight.
- **macOS only** — No Windows or Linux support planned.

## License

[MIT](LICENSE)
