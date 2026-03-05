#!/usr/bin/env bash
# Builds the .app with electron-builder, then creates a ULMO (LZMA) compressed DMG.
# ULMO gives ~71% compression vs ~62% for default zlib — saves ~15-20MB on the DMG.

set -euo pipefail

ARCH="${1:-arm64}"
VERSION=$(node -p 'require("./package.json").version')
APP_NAME="YT Music"
OUT_DIR="release"
DMG_NAME="YT-Music-${VERSION}-${ARCH}.dmg"

echo "Building ${APP_NAME} v${VERSION} (${ARCH})..."

CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac "--${ARCH}" --dir

APP_PATH="${OUT_DIR}/mac-${ARCH}/${APP_NAME}.app"
if [ ! -d "$APP_PATH" ]; then
  APP_PATH="${OUT_DIR}/mac/${APP_NAME}.app"
fi
if [ ! -d "$APP_PATH" ]; then
  echo "Build failed — .app not found in ${OUT_DIR}/mac-${ARCH}/ or ${OUT_DIR}/mac/"
  exit 1
fi

codesign --sign - --deep --force "$APP_PATH"
sleep 2

rm -f "${OUT_DIR}/${DMG_NAME}"

echo "Creating ULMO-compressed DMG..."
hdiutil create \
  -volname "$APP_NAME" \
  -srcfolder "$APP_PATH" \
  -ov \
  -format ULMO \
  -nospotlight \
  "${OUT_DIR}/${DMG_NAME}"

echo ""
echo "Done:"
ls -lh "${OUT_DIR}/${DMG_NAME}"
