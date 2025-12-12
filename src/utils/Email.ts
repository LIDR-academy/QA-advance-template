export type Email = string & { readonly __brand: 'Email' };

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validate(email: string): Email {
    if (!this.EMAIL_REGEX.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    return email as Email;
  }

  static isValid(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }
}
