import { Reservation } from './Reservation';
import { DuplicatePolicy } from './DuplicatePolicy';
import { Email } from '../../utils/Email';

export class ReservationService {
  private reservations: Map<string, Reservation> = new Map();

  constructor(private duplicatePolicy: DuplicatePolicy) {}

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const isDuplicate = await this.duplicatePolicy.check(reservation, Array.from(this.reservations.values()));

    if (isDuplicate) {
      throw new Error('Duplicate reservation detected');
    }

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  async getReservation(id: string): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async getAllReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }

  async deleteReservation(id: string): Promise<boolean> {
    return this.reservations.delete(id);
  }

  async findByEmail(email: Email): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(r => r.email === email);
  }
}
