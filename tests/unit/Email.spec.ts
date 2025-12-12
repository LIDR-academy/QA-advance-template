import { EmailValidator } from '../../src/utils/Email';

describe('EmailValidator', () => {
  describe('validate', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(() => EmailValidator.validate(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(() => EmailValidator.validate(email)).toThrow('Invalid email format');
      });
    });
  });

  describe('isValid', () => {
    it('should return true for valid emails', () => {
      expect(EmailValidator.isValid('test@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(EmailValidator.isValid('invalid')).toBe(false);
    });
  });
});
