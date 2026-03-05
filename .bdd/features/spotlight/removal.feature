@spotlight
Feature: Song removal from Spotlight index
  As the Electron main process
  I want to remove songs from the Spotlight index
  So that stale entries don't appear in search results

  Background:
    Given the Spotlight addon is loaded

  @smoke
  Scenario: Remove specific songs by ID
    When removing songs with IDs:
      | id       |
      | track-01 |
      | track-02 |
    Then the removal operation should complete without crashing

  Scenario: Remove songs with an empty ID list
    When removing songs with an empty ID list
    Then the removal operation should complete without crashing

  @smoke
  Scenario: Remove all indexed songs
    When removing all songs from the index
    Then the remove-all operation should complete without crashing
