# Installer mount point parsing bug

## Bug

`scripts/install.sh` fails with `cp: /YT Music.app: No such file or directory` when installing via curl.

## Root cause

`hdiutil attach` outputs tab-separated columns. The volume name "YT Music" appears on the last line followed by a trailing tab character:

```
/dev/disk4s1        	Apple_HFS                     	/Volumes/YT Music	
```

`grep -o '/Volumes/.*'` captures everything after `/Volumes/` including the trailing tab. The resulting `MOUNT_POINT` variable contains `/Volumes/YT Music\t`, making the cp path invalid.

Additionally, the script had no validation for an empty `MOUNT_POINT`. If `hdiutil attach` fails silently (stderr redirected to /dev/null), `MOUNT_POINT` becomes empty and the script attempts `cp -R "/YT Music.app"` — which is what the user saw.

## Fix

1. Added `sed 's/[[:space:]]*$//'` to the grep pipeline to strip trailing whitespace/tabs
2. Added empty `MOUNT_POINT` validation with a helpful error message

Before:
```bash
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse 2>/dev/null | grep -o '/Volumes/.*')
```

After:
```bash
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse 2>/dev/null | grep -o '/Volumes/.*' | sed 's/[[:space:]]*$//')
```

## BDD coverage

8 scenarios in `.bdd/features/installer/mount-parsing.feature`:
- Standard hdiutil output parsing
- Trailing tab character stripping (the exact bug)
- Trailing space stripping
- Simple volume names (no spaces)
- APFS partition table format
- No mount point in output (graceful failure)
- App source path construction
- Empty mount point validation
