# Changelog

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
