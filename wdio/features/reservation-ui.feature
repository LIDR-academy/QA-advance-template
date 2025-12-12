Feature: Reservation Management - UI Tests Only

  Background:
    Given I am on the reservation page

  Scenario Outline: Create reservation and verify UI changes
    When I fill the form with email "<email>", <adults> adults and <children> children
    And I click on "Reservar"
    Then I see the toast "<toast>"
    And the list changes by <delta> items

    Examples:
      | email                        | adults | children | toast                                                | delta |
      | maria.garcia@example.com     | 2      | 1        | Reserva creada exitosamente                          | 1     |
      | unique.email1@example.com    | 2      | 0        | Reserva creada exitosamente                          | 1     |
      | valid.booking@example.com    | 25     | 25       | Reserva creada exitosamente                          | 1     |
      | another.user@example.com     | 1      | 2        | Reserva creada exitosamente                          | 1     |
      | free.tour@example.com        | 1      | 0        | Reserva creada exitosamente                          | 1     |

  Scenario: Create reservation with valid data - UI verification
    When I fill the form with email "new.user@example.com", 2 adults and 1 children
    And I click on "Reservar"
    Then I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items

  Scenario: Create reservation with minimum people - UI verification
    When I fill the form with email "solo.traveler@example.com", 1 adults and 0 children
    And I click on "Reservar"
    Then I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items

  Scenario: Create reservation with maximum allowed people - UI verification
    When I fill the form with email "large.group@example.com", 30 adults and 20 children
    And I click on "Reservar"
    Then I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items

  Scenario: Verify form fields are present
    Then I should see the email input field
    And I should see the adults input field
    And I should see the children input field
    And I should see the submit button

  Scenario: Fill form and verify values
    When I fill the form with email "test@example.com", 3 adults and 2 children
    Then the email field should contain "test@example.com"
    And the adults field should contain "3"
    And the children field should contain "2"
