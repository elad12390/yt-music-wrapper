#!/usr/bin/env bash
set -euo pipefail

REPO="elad12390/yt-music-wrapper"
APP_NAME="YT Music"
INSTALL_DIR="/Applications"

echo "Installing $APP_NAME..."

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  PATTERN="arm64.dmg"
else
  PATTERN="x64.dmg"
fi

DOWNLOAD_URL=$(curl -sfL "https://api.github.com/repos/$REPO/releases/latest" \
  | grep "browser_download_url.*$PATTERN" \
  | head -1 \
  | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Could not find a $ARCH DMG in the latest release."
  echo "Check https://github.com/$REPO/releases manually."
  exit 1
fi

TMPDIR=$(mktemp -d)
DMG_PATH="$TMPDIR/ytmusic.dmg"

echo "Downloading $(basename "$DOWNLOAD_URL")..."
curl -#fL "$DOWNLOAD_URL" -o "$DMG_PATH"

echo "Mounting DMG..."
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse -quiet | tail -1 | awk '{print $3}')

if [ -d "$INSTALL_DIR/$APP_NAME.app" ]; then
  echo "Removing previous version..."
  rm -rf "$INSTALL_DIR/$APP_NAME.app"
fi

echo "Copying to $INSTALL_DIR..."
cp -R "$MOUNT_POINT/$APP_NAME.app" "$INSTALL_DIR/"

echo "Unmounting..."
hdiutil detach "$MOUNT_POINT" -quiet

echo "Removing Gatekeeper quarantine..."
xattr -cr "$INSTALL_DIR/$APP_NAME.app"

rm -rf "$TMPDIR"

echo ""
echo "✓ $APP_NAME installed to $INSTALL_DIR"
echo "  Open it from Applications or Spotlight."
