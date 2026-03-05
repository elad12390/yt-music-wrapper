#!/usr/bin/env bash
# Usage: ./scripts/bump-version.sh [patch|minor|major]

set -euo pipefail

BUMP_TYPE="${1:-patch}"

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

CURRENT=$(node -p 'require("./package.json").version')
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$BUMP_TYPE" in
  patch) PATCH=$((PATCH + 1)) ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
DATE=$(date +%Y-%m-%d)

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

CHANGELOG_ENTRY="## $NEW_VERSION ($DATE)

- 

"

if [ -f CHANGELOG.md ]; then
  EXISTING=$(cat CHANGELOG.md)
  echo -e "# Changelog\n\n${CHANGELOG_ENTRY}${EXISTING#*$'\n\n'}" > CHANGELOG.md
else
  echo -e "# Changelog\n\n${CHANGELOG_ENTRY}" > CHANGELOG.md
fi

echo "Bumped: $CURRENT → $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Edit CHANGELOG.md — fill in what changed"
echo "  2. git add -A && git commit -m \"release: v$NEW_VERSION\""
echo "  3. git push origin master"
