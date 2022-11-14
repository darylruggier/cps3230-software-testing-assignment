Feature: Test 5

  Scenario: Icon check
    Given I am an administrator of the website and I upload an alert of type <alert-type>
    Given I am a user of marketalertum
    When I view a list of alerts
    Then I should see 1 alert
    And the icon displayed should be <icon file name>
