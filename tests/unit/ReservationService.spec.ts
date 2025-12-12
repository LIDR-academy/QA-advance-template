import { ReservationService } from '../../src/domain/reservations/ReservationService';
import { Reservation } from '../../src/domain/reservations/Reservation';
import { NoDuplicatePolicy, EmailDuplicatePolicy, DuplicatePolicy } from '../../src/domain/reservations/DuplicatePolicy';
import { EmailValidator } from '../../src/utils/Email';
import { CurrencyUtils } from '../../src/utils/Currency';

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    service = new ReservationService(new NoDuplicatePolicy());
  });

  describe('createReservation', () => {
    it('should create a new reservation', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const result = await service.createReservation(reservation);

      expect(result).toBe(reservation);
    });

    it('should store the reservation internally', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      const retrieved = await service.getReservation(reservation.id);

      expect(retrieved).toBe(reservation);
    });

    it('should create multiple reservations with NoDuplicatePolicy', async () => {
      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);

      const all = await service.getAllReservations();
      expect(all).toHaveLength(2);
    });

    it('should reject duplicate reservations when EmailDuplicatePolicy is enabled', async () => {
      service = new ReservationService(new EmailDuplicatePolicy());

      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);

      await expect(service.createReservation(reservation2))
        .rejects.toThrow('Duplicate reservation detected');
    });

    it('should allow same email with NoDuplicatePolicy', async () => {
      const email = EmailValidator.validate('john@example.com');

      const reservation1 = Reservation.create({
        name: 'John Doe',
        email,
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'John Doe Jr',
        email,
        amount: CurrencyUtils.create(200, 'EUR')
      });

      await service.createReservation(reservation1);
      const result = await service.createReservation(reservation2);

      expect(result).toBe(reservation2);
    });

    it('should work with custom duplicate policy', async () => {
      const alwaysDuplicatePolicy: DuplicatePolicy = {
        check: async () => true
      };

      service = new ReservationService(alwaysDuplicatePolicy);

      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await expect(service.createReservation(reservation))
        .rejects.toThrow('Duplicate reservation detected');
    });

    it('should handle reservations with different currencies', async () => {
      const eurReservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const usdReservation = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('jane@example.com'),
        amount: CurrencyUtils.create(150, 'USD')
      });

      await service.createReservation(eurReservation);
      await service.createReservation(usdReservation);

      const all = await service.getAllReservations();
      expect(all).toHaveLength(2);
    });
  });

  describe('getReservation', () => {
    it('should return a reservation by id', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      const result = await service.getReservation(reservation.id);

      expect(result).toBe(reservation);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await service.getReservation('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string id', async () => {
      const result = await service.getReservation('');
      expect(result).toBeUndefined();
    });

    it('should retrieve correct reservation among multiple', async () => {
      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('jane@example.com'),
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);

      const result = await service.getReservation(reservation2.id);
      expect(result).toBe(reservation2);
    });
  });

  describe('getAllReservations', () => {
    it('should return empty array when no reservations exist', async () => {
      const result = await service.getAllReservations();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all created reservations', async () => {
      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('jane@example.com'),
        amount: CurrencyUtils.create(150, 'EUR')
      });

      const reservation3 = Reservation.create({
        name: 'Bob Smith',
        email: EmailValidator.validate('bob@example.com'),
        amount: CurrencyUtils.create(200, 'USD')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);
      await service.createReservation(reservation3);

      const result = await service.getAllReservations();

      expect(result).toHaveLength(3);
      expect(result).toContain(reservation1);
      expect(result).toContain(reservation2);
      expect(result).toContain(reservation3);
    });

    it('should return new array instance on each call', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);

      const result1 = await service.getAllReservations();
      const result2 = await service.getAllReservations();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('deleteReservation', () => {
    it('should delete an existing reservation', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      const deleted = await service.deleteReservation(reservation.id);

      expect(deleted).toBe(true);

      const retrieved = await service.getReservation(reservation.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false when deleting non-existent reservation', async () => {
      const deleted = await service.deleteReservation('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should only delete the specified reservation', async () => {
      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: EmailValidator.validate('jane@example.com'),
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);

      await service.deleteReservation(reservation1.id);

      const all = await service.getAllReservations();
      expect(all).toHaveLength(1);
      expect(all[0]).toBe(reservation2);
    });

    it('should allow recreation after deletion', async () => {
      const reservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      await service.deleteReservation(reservation.id);

      const newReservation = Reservation.create({
        name: 'John Doe',
        email: EmailValidator.validate('john@example.com'),
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const result = await service.createReservation(newReservation);
      expect(result).toBe(newReservation);
    });
  });

  describe('findByEmail', () => {
    it('should find reservations by email', async () => {
      const email = EmailValidator.validate('john@example.com');
      const reservation = Reservation.create({
        name: 'John Doe',
        email,
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      const results = await service.findByEmail(email);

      expect(results).toHaveLength(1);
      expect(results[0]).toBe(reservation);
    });

    it('should return empty array when no reservations match', async () => {
      const email = EmailValidator.validate('nonexistent@example.com');
      const results = await service.findByEmail(email);

      expect(results).toEqual([]);
      expect(results).toHaveLength(0);
    });

    it('should find multiple reservations with same email', async () => {
      const email = EmailValidator.validate('john@example.com');

      const reservation1 = Reservation.create({
        name: 'John Doe',
        email,
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'John Doe Jr',
        email,
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);

      const results = await service.findByEmail(email);

      expect(results).toHaveLength(2);
      expect(results).toContain(reservation1);
      expect(results).toContain(reservation2);
    });

    it('should only return reservations matching the exact email', async () => {
      const email1 = EmailValidator.validate('john@example.com');
      const email2 = EmailValidator.validate('jane@example.com');

      const reservation1 = Reservation.create({
        name: 'John Doe',
        email: email1,
        amount: CurrencyUtils.create(100, 'EUR')
      });

      const reservation2 = Reservation.create({
        name: 'Jane Doe',
        email: email2,
        amount: CurrencyUtils.create(150, 'EUR')
      });

      await service.createReservation(reservation1);
      await service.createReservation(reservation2);

      const results = await service.findByEmail(email1);

      expect(results).toHaveLength(1);
      expect(results[0]).toBe(reservation1);
    });

    it('should not find deleted reservations', async () => {
      const email = EmailValidator.validate('john@example.com');
      const reservation = Reservation.create({
        name: 'John Doe',
        email,
        amount: CurrencyUtils.create(100, 'EUR')
      });

      await service.createReservation(reservation);
      await service.deleteReservation(reservation.id);

      const results = await service.findByEmail(email);
      expect(results).toHaveLength(0);
    });
  });
});
