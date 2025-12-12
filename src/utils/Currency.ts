export interface Currency {
  amount: number;
  currency: string;
}

export class CurrencyUtils {
  static create(amount: number, currency: string = 'EUR'): Currency {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return { amount, currency };
  }

  static add(a: Currency, b: Currency): Currency {
    if (a.currency !== b.currency) {
      throw new Error('Cannot add different currencies');
    }
    return { amount: a.amount + b.amount, currency: a.currency };
  }

  static format(currency: Currency): string {
    return `${currency.amount.toFixed(2)} ${currency.currency}`;
  }
}
