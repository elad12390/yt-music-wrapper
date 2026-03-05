# Spotlight Addon Findings

Last run: 2026-03-05T19:35:00Z
Environment: Node.js via Playwright test runner (unsigned dev build)
Branch: main

## Scenario: Addon loads without crashing
- Status: PASSED
- All four exported functions confirmed: indexSongs, removeSongs, removeAllSongs, isIndexingAvailable

## Scenario: Indexing availability returns a boolean
- Status: PASSED

## Scenario: Index a single song with required fields
- Status: PASSED
- CoreSpotlight call completed without error (surprising for unsigned build)

## Scenario: Index multiple songs in a batch
- Status: PASSED

## Scenario: Index a song with optional artwork URL
- Status: PASSED

## Scenario: Index a song with optional duration
- Status: PASSED

## Scenario: Index an empty song list gracefully
- Status: PASSED
- Empty list handled as early return

## Scenario: Reject a song missing required id field
- Status: PASSED
- Validation correctly rejects empty id

## Scenario: Reject a song missing required title field
- Status: PASSED
- Validation correctly rejects empty title

## Scenario: Remove specific songs by ID
- Status: PASSED

## Scenario: Remove songs with an empty ID list
- Status: PASSED

## Scenario: Remove all indexed songs
- Status: PASSED

## Summary
- Passed: 12/12
- Failed: 0/12
- Blocked: 0

## Notes
- All CoreSpotlight operations completed without error even in unsigned dev build.
  This may mean corespotlightd accepts the calls but silently discards them.
  Actual Spotlight search results need verification in a signed/packaged build.
- The addon binary is arm64 only. x86_64 cross-compilation needed for Intel Macs.
