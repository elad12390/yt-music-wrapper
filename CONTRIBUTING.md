# Contributing

This is a hobby project — contributions are welcome but expectations are relaxed.

## Getting Started

```bash
git clone https://github.com/elad12390/yt-music-wrapper.git
cd yt-music-wrapper
npm install
./scripts/install-hooks.sh
npm run build:all
npm run dev
```

## Before Submitting a PR

1. Run `npm run build` — TypeScript must compile cleanly
2. Run `npm run test:bdd` — all BDD tests must pass
3. If you changed the Rust addon, run `npm run build:native` first

## Guidelines

- Keep changes small and focused
- Match existing code style
- No `as any`, `@ts-ignore`, or empty catch blocks
- BDD tests for new native addon functionality go in `.bdd/`

## Reporting Bugs

Open an issue with:
- What you expected
- What happened
- macOS version and architecture (arm64/x64)
