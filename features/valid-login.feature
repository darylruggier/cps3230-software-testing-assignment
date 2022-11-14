Feature: Test 1

  Scenario: Valid Login
    Given I am a user of marketalertum
    When I login using valid credentials
    Then I should see my alerts

