/**
 * Property-Based Testing (PBT) for Reservation Domain
 * Using fast-check to generate test cases and verify business rules
 *
 * Business Rules Tested:
 * 1. Valid inputs never cause 5xx errors
 * 2. Distinct reservations never trigger duplicate errors
 * 3. Generated emails and currencies pass validation
 * 4. Amount boundary: amount=0 is valid
 * 5. Duplicate detection: (activityId + email + date) triggers 409
 */

import * as fc from 'fast-check';
import { Reservation } from '../src/domain/reservations/Reservation';
import { ReservationService } from '../src/domain/reservations/ReservationService';
import { EmailDuplicatePolicy, NoDuplicatePolicy } from '../src/domain/reservations/DuplicatePolicy';
import { EmailValidator, Email } from '../src/utils/Email';
import { CurrencyUtils, Currency } from '../src/utils/Currency';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

/**
 * Detect if running under Stryker mutation testing
 * Stryker sets this environment variable when running tests
 */
const isMutationTesting = process.env.STRYKER === 'true' ||
                          process.env.NODE_ENV === 'mutation';

/**
 * Adjust number of runs based on execution context
 * - Mutation testing: Use fewer runs (5-10) for faster feedback
 * - Normal testing: Use standard runs (50-100) for thorough validation
 */
const NUM_RUNS = {
  standard: isMutationTesting ? 5 : 100,
  medium: isMutationTesting ? 5 : 50,
  small: isMutationTesting ? 3 : 30,
};

// ============================================================================
// CUSTOM ARBITRARIES
// ============================================================================

/**
 * Activity ID generator: simple format A-{number}
 * Examples: A-1, A-42, A-9999
 */
const activityIdArbitrary = fc.integer({ min: 1, max: 9999 }).map(n => `A-${n}`);

/**
 * Date generator: ISO 8601 format (YYYY-MM-DD)
 * Range: recent past to near future
 */
const dateArbitrary = fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
  .filter(d => !isNaN(d.getTime())) // Filter out invalid dates
  .map(d => d.toISOString().slice(0, 10));

/**
 * Adults count: business rule requires at least 1 adult
 */
const adultsArbitrary = fc.integer({ min: 1, max: 8 });

/**
 * Children count: 0 or more (optional)
 */
const childrenArbitrary = fc.integer({ min: 0, max: 6 });

/**
 * Email generator: uses fc.emailAddress() and validates with our EmailValidator
 */
const emailArbitrary = fc.emailAddress()
  .filter(email => EmailValidator.isValid(email))
  .map(email => EmailValidator.validate(email));

/**
 * Alternative email generator: compose simple valid emails
 * Format: {name}@{domain}.{tld}
 */
const simpleEmailArbitrary = fc.tuple(
  fc.string({ minLength: 3, maxLength: 10 }).map(s => s.replace(/[^a-z0-9]/g, 'x')),
  fc.constantFrom('example.com', 'test.com', 'domain.org', 'mail.net')
).map(([local, domain]) => EmailValidator.validate(`${local}@${domain}`));

/**
 * Payment amount: non-negative with 2 decimal places
 */
const amountArbitrary = fc.double({ min: 0, max: 5000, noNaN: true, noDefaultInfinity: true })
  .map(n => parseFloat(n.toFixed(2)));

/**
 * Currency code: ISO 4217 (3 uppercase letters)
 * Includes common currencies + random valid codes
 */
const currencyCodeArbitrary = fc.oneof(
  fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'),
  fc.stringMatching(/^[A-Z]{3}$/)
);

/**
 * Currency object generator
 */
const currencyArbitrary = fc.tuple(amountArbitrary, currencyCodeArbitrary)
  .map(([amount, code]) => CurrencyUtils.create(amount, code));

/**
 * Customer name generator
 */
const nameArbitrary = fc.tuple(
  fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
  fc.string({ minLength: 2, maxLength: 10 }).map(s => s.replace(/[^a-z]/g, 'a').toLowerCase())
).map(([first, rest]: [string, string]) => first + rest);

/**
 * Complete reservation input generator
 * Generates all fields needed to create a reservation
 */
interface ReservationInput {
  activityId: string;
  date: string;
  adults: number;
  children: number;
  email: Email;
  name: string;
  amount: Currency;
}

const reservationInputArbitrary: fc.Arbitrary<ReservationInput> = fc.record({
  activityId: activityIdArbitrary,
  date: dateArbitrary,
  adults: adultsArbitrary,
  children: childrenArbitrary,
  email: simpleEmailArbitrary,
  name: nameArbitrary,
  amount: currencyArbitrary
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a Reservation from input data
 * Note: The current Reservation model is simplified (name, email, amount)
 * In a real scenario, it would include activityId, date, adults, children
 */
function createReservationFromInput(input: ReservationInput): Reservation {
  return Reservation.create({
    name: input.name,
    email: input.email,
    amount: input.amount
  });
}

/**
 * Checks if two reservation inputs represent a duplicate
 * Business rule: duplicate = same (activityId + email + date)
 * Note: Current implementation only checks email (EmailDuplicatePolicy)
 */
function isDuplicateByBusinessRule(a: ReservationInput, b: ReservationInput): boolean {
  // Full business rule would be:
  // return a.activityId === b.activityId && a.email === b.email && a.date === b.date;

  // Current implementation only checks email (matching EmailDuplicatePolicy)
  return a.email === b.email;
}

// ============================================================================
// PROPERTY 1: Valid inputs never cause 5xx errors
// ============================================================================

describe('Property-Based Testing - Reservation Domain', () => {
  describe('Property 1: Valid inputs never cause logical errors', () => {
    it('should never throw unexpected errors for valid reservation inputs', async () => {
      await fc.assert(
        fc.asyncProperty(reservationInputArbitrary, async (input) => {
          const service = new ReservationService(new NoDuplicatePolicy());
          const reservation = createReservationFromInput(input);

          // Should not throw any error
          const result = await service.createReservation(reservation);

          expect(result).toBeDefined();
          expect(result.id).toBeDefined();
          expect(result.email).toBe(input.email);
          expect(result.name).toBe(input.name);
          expect(result.amount).toEqual(input.amount);
        }),
        { numRuns: NUM_RUNS.standard }
      );
    });

    it('should handle all valid currency codes without errors', () => {
      fc.assert(
        fc.property(currencyCodeArbitrary, amountArbitrary, (code, amount) => {
          // Valid currency codes should not throw
          const currency = CurrencyUtils.create(amount, code);

          expect(currency).toBeDefined();
          expect(currency.amount).toBe(amount);
          expect(currency.currency).toBe(code);
        }),
        { numRuns: NUM_RUNS.standard }
      );
    });
  });

  // ============================================================================
  // PROPERTY 2: Distinct reservations never trigger duplicate error
  // ============================================================================

  describe('Property 2: Distinct reservations never trigger duplicate error', () => {
    it('should allow creating multiple reservations with different emails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(reservationInputArbitrary, { minLength: 2, maxLength: 5 }),
          async (inputs) => {
            // Ensure all emails are distinct
            const uniqueEmails = new Set(inputs.map(i => i.email));
            if (uniqueEmails.size !== inputs.length) {
              return; // Skip if duplicates exist
            }

            const service = new ReservationService(new EmailDuplicatePolicy());

            // All should succeed (no duplicates)
            for (const input of inputs) {
              const reservation = createReservationFromInput(input);
              const result = await service.createReservation(reservation);
              expect(result).toBeDefined();
            }
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should reject duplicate reservations (same email)', async () => {
      await fc.assert(
        fc.asyncProperty(
          reservationInputArbitrary,
          async (input) => {
            const service = new ReservationService(new EmailDuplicatePolicy());

            // First reservation should succeed
            const reservation1 = createReservationFromInput(input);
            await service.createReservation(reservation1);

            // Second reservation with same email should fail
            const reservation2 = createReservationFromInput(input);

            await expect(service.createReservation(reservation2))
              .rejects
              .toThrow('Duplicate reservation detected');
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });
  });

  // ============================================================================
  // PROPERTY 3: Email and currency validation
  // ============================================================================

  describe('Property 3: Generated emails and currencies pass validation', () => {
    it('should validate all generated emails correctly', () => {
      fc.assert(
        fc.property(simpleEmailArbitrary, (email) => {
          // All generated emails should be valid
          expect(EmailValidator.isValid(email)).toBe(true);

          // Should not throw when validating
          const validated = EmailValidator.validate(email);
          expect(validated).toBe(email);
        }),
        { numRuns: NUM_RUNS.standard }
      );
    });

    it('should accept all valid ISO 4217 currency codes', () => {
      fc.assert(
        fc.property(currencyArbitrary, (currency) => {
          // All generated currencies should have valid structure
          expect(currency).toHaveProperty('amount');
          expect(currency).toHaveProperty('currency');
          expect(currency.amount).toBeGreaterThanOrEqual(0);
          expect(currency.currency).toMatch(/^[A-Z]{3}$/);

          // Should be able to format without errors
          const formatted = CurrencyUtils.format(currency);
          expect(formatted).toContain(currency.currency);
        }),
        { numRuns: NUM_RUNS.standard }
      );
    });

    it('should handle currency operations correctly', () => {
      fc.assert(
        fc.property(
          amountArbitrary,
          amountArbitrary,
          currencyCodeArbitrary,
          (amount1, amount2, code) => {
            const currency1 = CurrencyUtils.create(amount1, code);
            const currency2 = CurrencyUtils.create(amount2, code);

            // Addition should work for same currency
            const sum = CurrencyUtils.add(currency1, currency2);

            expect(sum.currency).toBe(code);
            expect(sum.amount).toBeCloseTo(amount1 + amount2, 2);
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });
  });

  // ============================================================================
  // PROPERTY 4: Boundary testing - amount = 0 is valid
  // ============================================================================

  describe('Property 4: Amount boundary - zero is valid', () => {
    it('should accept amount = 0 as valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          simpleEmailArbitrary,
          nameArbitrary,
          currencyCodeArbitrary,
          async (email, name, code) => {
            const service = new ReservationService(new NoDuplicatePolicy());
            const amount = CurrencyUtils.create(0, code);

            const reservation = Reservation.create({ name, email, amount });
            const result = await service.createReservation(reservation);

            expect(result).toBeDefined();
            expect(result.amount.amount).toBe(0);
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should reject negative amounts', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -0.01, noNaN: true }),
          currencyCodeArbitrary,
          (negativeAmount, code) => {
            // Negative amounts should throw
            expect(() => CurrencyUtils.create(negativeAmount, code))
              .toThrow('Amount cannot be negative');
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should handle boundary values correctly', () => {
      fc.assert(
        fc.property(currencyCodeArbitrary, (code) => {
          // Test exact boundaries
          const zero = CurrencyUtils.create(0, code);
          expect(zero.amount).toBe(0);

          const small = CurrencyUtils.create(0.01, code);
          expect(small.amount).toBe(0.01);

          const large = CurrencyUtils.create(5000, code);
          expect(large.amount).toBe(5000);
        }),
        { numRuns: NUM_RUNS.medium }
      );
    });
  });

  // ============================================================================
  // PROPERTY 5: Duplicate detection based on email (current implementation)
  // ============================================================================

  describe('Property 5: Duplicate detection logic', () => {
    it('should detect duplicates when email matches', async () => {
      await fc.assert(
        fc.asyncProperty(
          reservationInputArbitrary,
          reservationInputArbitrary,
          async (input1, input2) => {
            const service = new ReservationService(new EmailDuplicatePolicy());

            // Create first reservation
            const reservation1 = createReservationFromInput(input1);
            await service.createReservation(reservation1);

            // Create second reservation
            const reservation2 = createReservationFromInput(input2);

            const shouldBeDuplicate = isDuplicateByBusinessRule(input1, input2);

            if (shouldBeDuplicate) {
              // Should throw duplicate error
              await expect(service.createReservation(reservation2))
                .rejects
                .toThrow('Duplicate reservation detected');
            } else {
              // Should succeed
              const result = await service.createReservation(reservation2);
              expect(result).toBeDefined();
            }
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should allow same email with NoDuplicatePolicy', async () => {
      await fc.assert(
        fc.asyncProperty(
          reservationInputArbitrary,
          async (input) => {
            const service = new ReservationService(new NoDuplicatePolicy());

            // Should allow multiple reservations with same email
            const reservation1 = createReservationFromInput(input);
            const reservation2 = createReservationFromInput(input);

            await service.createReservation(reservation1);
            const result = await service.createReservation(reservation2);

            expect(result).toBeDefined();
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should maintain duplicate detection after deletions', async () => {
      await fc.assert(
        fc.asyncProperty(
          reservationInputArbitrary,
          async (input) => {
            const service = new ReservationService(new EmailDuplicatePolicy());

            // Create reservation
            const reservation1 = createReservationFromInput(input);
            const created = await service.createReservation(reservation1);

            // Delete it
            const deleted = await service.deleteReservation(created.id);
            expect(deleted).toBe(true);

            // Should allow creating again with same email
            const reservation2 = createReservationFromInput(input);
            const result = await service.createReservation(reservation2);

            expect(result).toBeDefined();
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });
  });

  // ============================================================================
  // BONUS: Idempotency and invariant properties
  // ============================================================================

  describe('Bonus: Idempotency and invariants', () => {
    it('should maintain count invariant: create adds, delete removes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(reservationInputArbitrary, { minLength: 1, maxLength: 10 }),
          async (inputs) => {
            // Use unique emails to avoid duplicates
            const uniqueInputs = inputs.filter((input, index, self) =>
              index === self.findIndex(i => i.email === input.email)
            );

            const service = new ReservationService(new EmailDuplicatePolicy());

            let expectedCount = 0;

            // Create all reservations
            for (const input of uniqueInputs) {
              const reservation = createReservationFromInput(input);
              await service.createReservation(reservation);
              expectedCount++;
            }

            const allReservations = await service.getAllReservations();
            expect(allReservations.length).toBe(expectedCount);
          }
        ),
        { numRuns: NUM_RUNS.small }
      );
    });

    it('should be idempotent for get operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          reservationInputArbitrary,
          async (input) => {
            const service = new ReservationService(new NoDuplicatePolicy());

            const reservation = createReservationFromInput(input);
            const created = await service.createReservation(reservation);

            // Multiple gets should return same data
            const get1 = await service.getReservation(created.id);
            const get2 = await service.getReservation(created.id);
            const get3 = await service.getReservation(created.id);

            expect(get1).toEqual(get2);
            expect(get2).toEqual(get3);
          }
        ),
        { numRuns: NUM_RUNS.medium }
      );
    });

    it('should maintain email filter correctness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(reservationInputArbitrary, { minLength: 3, maxLength: 10 }),
          simpleEmailArbitrary,
          async (inputs, searchEmail) => {
            const service = new ReservationService(new NoDuplicatePolicy());

            // Create all reservations
            for (const input of inputs) {
              const reservation = createReservationFromInput(input);
              await service.createReservation(reservation);
            }

            // Search by email
            const found = await service.findByEmail(searchEmail);

            // All found reservations should have the search email
            for (const reservation of found) {
              expect(reservation.email).toBe(searchEmail);
            }

            // Count should match input count for that email
            const expectedCount = inputs.filter(i => i.email === searchEmail).length;
            expect(found.length).toBe(expectedCount);
          }
        ),
        { numRuns: NUM_RUNS.small }
      );
    });
  });
});
