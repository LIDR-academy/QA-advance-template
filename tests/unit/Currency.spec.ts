import { CurrencyUtils } from '../../src/utils/Currency';

describe('CurrencyUtils', () => {
  describe('create', () => {
    it('should create a currency with default EUR', () => {
      const currency = CurrencyUtils.create(100);
      expect(currency.amount).toBe(100);
      expect(currency.currency).toBe('EUR');
    });

    it('should create a currency with specified currency', () => {
      const currency = CurrencyUtils.create(100, 'USD');
      expect(currency.amount).toBe(100);
      expect(currency.currency).toBe('USD');
    });

    it('should reject negative amounts', () => {
      expect(() => CurrencyUtils.create(-10)).toThrow('Amount cannot be negative');
    });
  });

  describe('add', () => {
    it('should add currencies with same currency code', () => {
      const a = CurrencyUtils.create(100, 'EUR');
      const b = CurrencyUtils.create(50, 'EUR');
      const result = CurrencyUtils.add(a, b);

      expect(result.amount).toBe(150);
      expect(result.currency).toBe('EUR');
    });

    it('should reject adding different currencies', () => {
      const a = CurrencyUtils.create(100, 'EUR');
      const b = CurrencyUtils.create(50, 'USD');

      expect(() => CurrencyUtils.add(a, b)).toThrow('Cannot add different currencies');
    });
  });

  describe('format', () => {
    it('should format currency with 2 decimal places', () => {
      const currency = CurrencyUtils.create(100.5, 'EUR');
      expect(CurrencyUtils.format(currency)).toBe('100.50 EUR');
    });

    it('should format whole numbers correctly', () => {
      const currency = CurrencyUtils.create(100, 'USD');
      expect(CurrencyUtils.format(currency)).toBe('100.00 USD');
    });
  });
});
