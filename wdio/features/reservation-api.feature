Feature: Reservation Management - Data Driven Tests

  Background:
    Given I am on the reservation page

  Scenario Outline: Create reservation with different data sets
    When I fill the form with email "<email>", <adults> adults and <children> children
    And I click on "Reservar"
    Then the network responds with status <status>
    And I see the toast "<toast>"
    And the list changes by <delta> items

    Examples:
      | email                        | adults | children | status | toast                                                | delta |
      | maria.garcia@example.com     | 2      | 1        | 201    | Reserva creada exitosamente                          | 1     |
      | unique.email1@example.com    | 2      | 0        | 201    | Reserva creada exitosamente                          | 1     |
      | valid.booking@example.com    | 25     | 25       | 201    | Reserva creada exitosamente                          | 1     |
      | another.user@example.com     | 1      | 2        | 201    | Reserva creada exitosamente                          | 1     |
      | free.tour@example.com        | 1      | 0        | 201    | Reserva creada exitosamente                          | 1     |

  Scenario: Create reservation with valid data
    When I fill the form with email "new.user@example.com", 2 adults and 1 children
    And I click on "Reservar"
    Then the network responds with status 201
    And I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items

  Scenario: Create reservation with minimum people
    When I fill the form with email "solo.traveler@example.com", 1 adults and 0 children
    And I click on "Reservar"
    Then the network responds with status 201
    And I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items

  Scenario: Create reservation with maximum allowed people
    When I fill the form with email "large.group@example.com", 30 adults and 20 children
    And I click on "Reservar"
    Then the network responds with status 201
    And I see the toast "Reserva creada exitosamente"
    And the list changes by 1 items
