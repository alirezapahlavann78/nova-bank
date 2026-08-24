import { normalizePhone, normalizeEmail } from '@nova-bank/validation';

describe('normalizePhone', () => {
  it('should normalize Persian digits', () => {
    expect(normalizePhone('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
  });

  it('should normalize Arabic digits', () => {
    expect(normalizePhone('٩١٢٣٤٥٦٧٨٩')).toBe('9123456789');
  });

  it('should convert +98 prefix to 0', () => {
    expect(normalizePhone('+989123456789')).toBe('09123456789');
  });

  it('should remove non-digit characters except leading +', () => {
    expect(normalizePhone('0912-345-6789')).toBe('09123456789');
  });
});

describe('normalizeEmail', () => {
  it('should trim and lowercase email', () => {
    expect(normalizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
  });
});
