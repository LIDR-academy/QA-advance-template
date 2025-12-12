import { Email } from '../../utils/Email';
import { Currency } from '../../utils/Currency';

export interface ReservationData {
  id: string;
  name: string;
  email: Email;
  amount: Currency;
  createdAt: Date;
}

export class Reservation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: Email,
    public readonly amount: Currency,
    public readonly createdAt: Date
  ) {}

  static create(data: Omit<ReservationData, 'id' | 'createdAt'>): Reservation {
    return new Reservation(
      crypto.randomUUID(),
      data.name,
      data.email,
      data.amount,
      new Date()
    );
  }

  toJSON(): ReservationData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      amount: this.amount,
      createdAt: this.createdAt
    };
  }
}
