import { Reservation } from './Reservation';

export interface DuplicatePolicy {
  check(reservation: Reservation, existing: Reservation[]): Promise<boolean>;
}

export class EmailDuplicatePolicy implements DuplicatePolicy {
  async check(reservation: Reservation, existing: Reservation[]): Promise<boolean> {
    return existing.some(r => r.email === reservation.email);
  }
}

export class NoDuplicatePolicy implements DuplicatePolicy {
  async check(_reservation: Reservation, _existing: Reservation[]): Promise<boolean> {
    return false;
  }
}
