import CryptoJS from 'crypto-js';

export class HashGenerator {
  /**
   * Generate unique hash for transaction deduplication
   * Uses: amount + date + merchant + bank + type
   */
  static generate(transaction) {
    const {
      amount,
      date,
      merchant = 'Unknown',
      bank = 'Unknown',
      type,
      refNumber,
    } = transaction;

    // If we have a reference number (bank's unique ID), use it
    if (refNumber && refNumber.trim()) {
      const input = `${bank}_${refNumber}`;
      return CryptoJS.SHA256(input).toString();
    }

    // Otherwise, create hash from transaction details
    const input = [
      amount.toFixed(2),
      date,
      merchant.trim().toLowerCase(),
      bank.trim().toLowerCase(),
      type,
    ].join('_');

    return CryptoJS.SHA256(input).toString();
  }

  /**
   * Validate if a hash looks correct
   */
  static isValid(hash) {
    return /^[a-f0-9]{64}$/.test(hash);
  }
}

export default HashGenerator;