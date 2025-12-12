import { Reservation } from '../../src/domain/reservations/Reservation';
import { EmailValidator } from '../../src/utils/Email';
import { CurrencyUtils } from '../../src/utils/Currency';

describe('Reservation', () => {
  describe('constructor', () => {
    it('should create a reservation with all properties', () => {
      const id = 'test-id-123';
      const name = 'John Doe';
      const email = EmailValidator.validate('john@example.com');
      const amount = CurrencyUtils.create(100, 'EUR');
      const createdAt = new Date('2024-01-01');

      const reservation = new Reservation(id, name, email, amount, createdAt);

      expect(reservation.id).toBe(id);
      expect(reservation.name).toBe(name);
      expect(reservation.email).toBe(email);
      expect(reservation.amount).toBe(amount);
      expect(reservation.createdAt).toBe(createdAt);
    });

    it('should create reservation with readonly properties', () => {
      const reservation = new Reservation(
        'id',
        'John Doe',
        EmailValidator.validate('john@example.com'),
        CurrencyUtils.create(100, 'EUR'),
        new Date()
      );

      // TypeScript enforces readonly at compile time
      // This test verifies the object structure
      expect(Object.getOwnPropertyDescriptor(reservation, 'id')).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a reservation with generated id and createdAt', () => {
      const name = 'John Doe';
      const email = EmailValidator.validate('john@example.com');
      const amount = CurrencyUtils.create(100, 'EUR');

      const reservation = Reservation.create({ name, email, amount });

      expect(reservation.id).toBeDefined();
      expect(reservation.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(reservation.name).toBe(name);
      expect(reservation.email).toBe(email);
      expect(reservation.amount).toBe(amount);
      expect(reservation.createdAt).toBeInstanceOf(Date);
      expect(reservation.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should generate unique ids for multiple reservations', () => {
      const data = {
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR'),
      };

      const reservation1 = Reservation.create(data);
      const reservation2 = Reservation.create(data);

      expect(reservation1.id).not.toBe(reservation2.id);
    });

    it('should create reservation with different currencies', () => {
      const usdReservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'USD'),
      });

      expect(usdReservation.amount.currency).toBe('USD');
      expect(usdReservation.amount.amount).toBe(100);
    });

    it('should handle long names', () => {
      const longName = 'A'.repeat(200);
      const reservation = Reservation.create({
        name: longName,
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR'),
      });

      expect(reservation.name).toBe(longName);
      expect(reservation.name.length).toBe(200);
    });

    it('should handle special characters in name', () => {
      const specialName = 'José María Ñoño-O\'Brien';
      const reservation = Reservation.create({
        name: specialName,
        email: EmailValidator.validate('jose@example.com'),
        amount: CurrencyUtils.create(100, 'EUR'),
      });

      expect(reservation.name).toBe(specialName);
    });

    it('should handle zero amount', () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(0, 'EUR'),
      });

      expect(reservation.amount.amount).toBe(0);
    });

    it('should handle large amounts', () => {
      const largeAmount = 999999.99;
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(largeAmount, 'EUR'),
      });

      expect(reservation.amount.amount).toBe(largeAmount);
    });
  });

  describe('toJSON', () => {
    it('should convert reservation to JSON object', () => {
      const id = 'test-id-123';
      const name = 'John Doe';
      const email = EmailValidator.validate('john@example.com');
      const amount = CurrencyUtils.create(100, 'EUR');
      const createdAt = new Date('2024-01-01T10:00:00.000Z');

      const reservation = new Reservation(id, name, email, amount, createdAt);
      const json = reservation.toJSON();

      expect(json).toEqual({
        id,
        name,
        email,
        amount,
        createdAt,
      });
    });

    it('should return object with all properties', () => {
      const reservation = Reservation.create({
        name: 'Jane Smith',
        email: EmailValidator.validate('jane@example.com'),
        amount: CurrencyUtils.create(250.50, 'USD'),
      });

      const json = reservation.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('amount');
      expect(json).toHaveProperty('createdAt');
      expect(Object.keys(json)).toHaveLength(5);
    });

    it('should preserve currency information in JSON', () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(123.45, 'GBP'),
      });

      const json = reservation.toJSON();

      expect(json.amount.amount).toBe(123.45);
      expect(json.amount.currency).toBe('GBP');
    });

    it('should preserve date in JSON', () => {
      const specificDate = new Date('2024-06-15T14:30:00.000Z');
      const reservation = new Reservation(
        'id-123',
        'John Doe',
        EmailValidator.validate('john@example.com'),
        CurrencyUtils.create(100, 'EUR'),
        specificDate
      );

      const json = reservation.toJSON();

      expect(json.createdAt).toBe(specificDate);
      expect(json.createdAt.toISOString()).toBe('2024-06-15T14:30:00.000Z');
    });
  });
});
