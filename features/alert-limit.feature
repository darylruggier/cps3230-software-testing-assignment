Feature: Test 4 

  Scenario: Alert limit
    Given I am an administrator of the website and I upload more than 5 alerts
    Given I am a user of marketalertum
    When I view a list of alerts
    Then I should see 5 alerts
