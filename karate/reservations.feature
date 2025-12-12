Feature: Reservations API Contract Tests

  Background:
    * url 'http://127.0.0.1:4010'
    * configure headers = { Authorization: 'Bearer fake-token-for-testing', 'Content-Type': 'application/json', Accept: 'application/json' }

  @contract
  Scenario: POST /reservations - Success 201
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_madrid_tour_2024",
      "customerName": "María García López",
      "email": "maria.garcia@example.com",
      "phone": "+34612345678",
      "date": "2024-12-15",
      "time": "10:00",
      "numberOfPeople": 2,
      "totalAmount": {
        "value": 89.90,
        "currency": "EUR"
      },
      "language": "es"
    }
    """
    When method POST
    Then status 201
    And match response.id == '#present'
    And match response.status == 'confirmed'
    And match response.confirmationCode == '#present'

  @contract
  Scenario: POST /reservations - Valid Request with Different Email
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_madrid_tour_2024",
      "customerName": "María García López",
      "email": "another@example.com",
      "phone": "+34612345678",
      "date": "2024-12-15",
      "time": "10:00",
      "numberOfPeople": 2,
      "totalAmount": {
        "value": 89.90,
        "currency": "EUR"
      }
    }
    """
    When method POST
    Then status 201
    And match response.id == '#present'
    And match response.status == 'confirmed'

  @contract
  Scenario: POST /reservations - Validation Error 422 (Invalid Email)
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_sevilla_tour_2024",
      "customerName": "John Doe",
      "email": "invalid-email",
      "date": "2024-12-18",
      "numberOfPeople": 2,
      "totalAmount": {
        "value": 80.00,
        "currency": "EUR"
      }
    }
    """
    When method POST
    Then status 422
    And match response.error.code == 'VALIDATION_ERROR'
    And match response.error.validationErrors == '#present'

  @contract
  Scenario: POST /reservations - Validation Error 422 (Missing Fields)
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_valencia_tour_2024",
      "email": "test@example.com"
    }
    """
    When method POST
    Then status 422
    And match response.error.code == 'VALIDATION_ERROR'

  @contract
  Scenario: POST /reservations - Valid Request (Auth Accepted)
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_madrid_tour_2024",
      "customerName": "Test User",
      "email": "test@example.com",
      "phone": "+34612345678",
      "date": "2024-12-15",
      "time": "10:00",
      "numberOfPeople": 1,
      "totalAmount": {
        "value": 50.00,
        "currency": "EUR"
      }
    }
    """
    When method POST
    Then status 201
    And match response.id == '#present'

  @contract
  Scenario: POST /reservations - Valid Request with Maximum People
    Given path '/reservations'
    And request
    """
    {
      "activityId": "act_barcelona_tour_2024",
      "customerName": "John Smith",
      "email": "group.booking@example.com",
      "phone": "+34612345678",
      "date": "2024-12-20",
      "time": "10:00",
      "numberOfPeople": 50,
      "totalAmount": {
        "value": 2500.00,
        "currency": "EUR"
      },
      "specialRequirements": "Large group booking with special requirements"
    }
    """
    When method POST
    Then status 201
    And match response.id == '#present'
