@spotlight @smoke
Feature: Spotlight addon loading
  As the Electron main process
  I want to load the native Spotlight addon
  So that I can index songs for macOS Spotlight search

  @critical
  Scenario: Addon loads without crashing
    Given the Spotlight addon is loaded
    Then it should export the "indexSongs" function
    And it should export the "removeSongs" function
    And it should export the "removeAllSongs" function
    And it should export the "isIndexingAvailable" function

  Scenario: Indexing availability returns a boolean
    Given the Spotlight addon is loaded
    When checking if indexing is available
    Then the result should be a boolean
