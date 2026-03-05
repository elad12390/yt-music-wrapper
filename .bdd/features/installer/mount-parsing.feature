Feature: DMG mount point parsing
  The install script must correctly extract the mount point from
  hdiutil attach output, even when the volume name contains spaces
  or the output contains trailing whitespace/tabs.

  Background:
    Given the installer helpers are loaded

  Scenario: Parse mount point from standard hdiutil output
    When parsing hdiutil output:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_HFS                     	/Volumes/YT Music
      """
    Then the mount point should be "/Volumes/YT Music"

  Scenario: Raw output must not contain trailing whitespace
    When parsing hdiutil output with trailing tabs:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_HFS                     	/Volumes/YT Music	
      """
    Then the raw mount point should be "/Volumes/YT Music"

  Scenario: Parse mount point with trailing spaces
    When parsing hdiutil output:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_HFS                     	/Volumes/YT Music   
      """
    Then the mount point should be "/Volumes/YT Music"

  Scenario: Parse mount point with simple volume name (no spaces)
    When parsing hdiutil output:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_HFS                     	/Volumes/MyApp
      """
    Then the mount point should be "/Volumes/MyApp"

  Scenario: Parse mount point with APFS output format
    When parsing hdiutil output:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_APFS                    	
      /dev/disk4s2        	Apple_HFS                     	/Volumes/YT Music
      """
    Then the mount point should be "/Volumes/YT Music"

  Scenario: Fail gracefully when hdiutil output has no mount point
    When parsing hdiutil output:
      """
      /dev/disk4          	GUID_partition_scheme          	
      /dev/disk4s1        	Apple_APFS                    	
      """
    Then the mount point should be empty

  Scenario: Build correct app source path from mount point
    Given the mount point is "/Volumes/YT Music"
    And the app name is "YT Music"
    When building the app source path
    Then the app source path should be "/Volumes/YT Music/YT Music.app"

  Scenario: Detect empty mount point before copy
    Given the mount point is ""
    And the app name is "YT Music"
    When validating the mount point
    Then validation should fail with "mount" error
