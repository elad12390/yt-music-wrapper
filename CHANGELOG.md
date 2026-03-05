# Changelog

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
