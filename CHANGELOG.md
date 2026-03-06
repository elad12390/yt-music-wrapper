# Changelog

## 1.0.14 (2026-03-06)

- Fix quit blocked during playback — bypass YouTube Music's beforeunload dialog

## 1.0.13 (2026-03-06)

- Fix swapped like/dislike shortcuts (Cmd+Shift+Up = Like, Cmd+Shift+Down = Dislike)

## 1.0.12 (2026-03-06)

- Security: fix code injection via deep link — use loadURL instead of executeJavaScript
- Replace 15+ silent catch blocks with console.warn for debuggability
- Extract app.on('ready') into named setup functions for readability
- Remove unused parent param from PiP window
- Detect architecture from UA instead of hardcoding 'arm' in stealth
- Reset all module state in stopTrackMonitor to prevent stale data
- Remove redundant identity .map() in spotlight indexing
- Deduplicate sleep timer cleanup logic

## 1.0.11 (2026-03-06)

- Fix app icon: full-bleed red background so macOS applies squircle mask (standard dock size)

## 1.0.10 (2026-03-06)

- Resize app icon to standard macOS size (proper padding, ~76% content ratio)

## 1.0.9 (2026-03-05)

- Fix curl installer: strip trailing whitespace from hdiutil mount point output
- Add mount point validation with helpful error message on failure
- BDD test suite for installer mount parsing (8 scenarios)

## 1.0.8 (2026-03-05)

- Fix curl installer: mount point parsing failed on volume names with spaces

## 1.0.7 (2026-03-05)

- Fix CI x64 build: electron-builder outputs to release/mac/ not release/mac-x64/

## 1.0.6 (2026-03-05)

- Fix CI DMG creation: hdiutil "Resource busy" on GitHub Actions runner

## 1.0.5 (2026-03-05)

- DMG size reduced 96MB → 72MB (−25%) via ULMO (LZMA) compression
- Stripped 219 unused Chromium locale dirs (−46MB unpacked)
- App on disk reduced 260MB → 214MB (−18%)

## 1.0.4 (2026-03-05)

- One-line curl installer: auto-detects arch, downloads DMG, installs, removes quarantine

## 1.0.3 (2026-03-05)

- README: step-by-step Gatekeeper bypass instructions (3 methods)
- Added `scripts/allow-macos.sh` quarantine removal helper

## 1.0.2 (2026-03-05)

- Prepare for open source: MIT license, README, CONTRIBUTING
- GitHub issue templates (bug report, feature request) and PR template

## 1.0.1 (2026-03-05)

- CI/CD builds installable DMGs for arm64 and x64
- Auto-generated release notes from commits
- Ad-hoc code signing in CI for Spotlight compatibility
- macOS entitlements for JIT, network, and library validation
- Artifact names include version and architecture

## 1.0.0 (2026-03-05)

Initial release.

- Electron wrapper for YouTube Music with DRM/Widevine support
- Media key registration (Play/Pause, Next, Previous)
- System tray with playback controls and current track info
- Picture-in-Picture mini player
- Like/Dislike shortcuts (Cmd+Shift+Down / Cmd+Shift+Up)
- Volume shortcuts (Cmd+Up / Cmd+Down)
- Sleep timer with presets (15/30/45/60/90/120 min)
- Track change notifications
- macOS Spotlight integration via Rust native addon (napi-rs + Core Spotlight)
- Deep link handling (ytmusic:// protocol)
- Session persistence and Google auth popup handling
- CI/CD auto-release on master push
- Pre-push hook enforcing version bump and changelog
