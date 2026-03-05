#!/usr/bin/env bash
# Removes macOS Gatekeeper quarantine from YT Music.app

set -euo pipefail

APP_PATH="/Applications/YT Music.app"

if [ ! -d "$APP_PATH" ]; then
  APP_PATH="$HOME/Applications/YT Music.app"
fi

if [ ! -d "$APP_PATH" ]; then
  echo "YT Music.app not found in /Applications or ~/Applications"
  echo "Drag it to Applications first, then run this again."
  exit 1
fi

xattr -cr "$APP_PATH"
echo "Done — YT Music is now allowed to run."
echo "Open it from Applications or Spotlight."
