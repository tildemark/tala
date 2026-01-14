import crypto from 'crypto';

/**
 * TALA Encryption Utility
 * Handles AES-256 encryption/decryption for sensitive personal information (SPI)
 * Compliant with DPA 2012
 */

const ALGORITHM = 'aes-256-cbc';

export class EncryptionService {
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    // Use SHA-256 hash of key to ensure exactly 32 bytes
    return crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Encrypt sensitive data using AES-256-CBC
   */
  static encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = this.getEncryptionKey();
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV + encrypted data (IV must be stored with ciphertext)
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt AES-256-CBC encrypted data
   */
  static decrypt(encrypted: string): string {
    try {
      const [ivHex, encryptedData] = encrypted.split(':');
      if (!ivHex || !encryptedData) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const key = this.getEncryptionKey();
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
}

/**
 * Data Masking Utility - Hide sensitive information based on permissions
 */
export class DataMaskingService {
  /**
   * Mask TIN (Tax Identification Number)
   * Format: 000-000-000-000 → 000-***-***-000
   */
  static maskTIN(tin: string): string {
    if (!tin || tin.length < 12) return tin;
    return `${tin.substring(0, 3)}-***-***-${tin.substring(9)}`;
  }

  /**
   * Mask Bank Account Number
   * Example: 1234567890123456 → ****7890
   */
  static maskBankAccount(account: string): string {
    if (!account || account.length < 4) return account;
    return `****${account.substring(account.length - 4)}`;
  }

  /**
   * Mask Email Address
   * Example: john.doe@example.com → j***@example.com
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    return `${name.charAt(0)}***@${domain}`;
  }

  /**
   * Mask Phone Number
   * Example: +639171234567 → +63***234567
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return phone;
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 6);
    return `${start}***${end}`;
  }

  /**
   * Generic masking: show only first and last N characters
   */
  static maskGeneric(value: string, showFirst: number = 3, showLast: number = 3): string {
    if (!value || value.length <= showFirst + showLast) return value;
    const first = value.substring(0, showFirst);
    const last = value.substring(value.length - showLast);
    return `${first}${'*'.repeat(value.length - showFirst - showLast)}${last}`;
  }
}

export default {
  EncryptionService,
  DataMaskingService,
};
