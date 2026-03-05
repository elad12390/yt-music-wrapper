@spotlight
Feature: Song indexing via Core Spotlight
  As the Electron main process
  I want to index recently played songs in macOS Spotlight
  So that the user can find songs from system search

  Background:
    Given the Spotlight addon is loaded

  @smoke @critical
  Scenario: Index a single song with required fields
    When indexing the following songs:
      | id       | title         | artist       | album         |
      | track-01 | Bohemian Rhapsody | Queen    | A Night at the Opera |
    Then the indexing operation should complete without crashing

  Scenario: Index multiple songs in a batch
    When indexing the following songs:
      | id       | title            | artist        | album            |
      | track-01 | Bohemian Rhapsody | Queen        | A Night at the Opera |
      | track-02 | Stairway to Heaven | Led Zeppelin | Led Zeppelin IV  |
      | track-03 | Hotel California | Eagles        | Hotel California |
    Then the indexing operation should complete without crashing

  Scenario: Index a song with optional artwork URL
    When indexing a song with artwork:
      | id       | title         | artist | album     | artworkUrl                          |
      | track-04 | Imagine       | John Lennon | Imagine | https://i.ytimg.com/vi/abc/hqdefault.jpg |
    Then the indexing operation should complete without crashing

  Scenario: Index a song with optional duration
    When indexing a song with duration:
      | id       | title     | artist | album   | duration |
      | track-05 | Yesterday | The Beatles | Help! | 125.5  |
    Then the indexing operation should complete without crashing

  Scenario: Index an empty song list gracefully
    When indexing an empty list of songs
    Then the indexing operation should complete without crashing

  Scenario: Reject a song missing required id field
    When indexing a song without an id
    Then the operation should fail with a type error

  Scenario: Reject a song missing required title field
    When indexing a song without a title
    Then the operation should fail with a type error
