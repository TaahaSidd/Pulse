import CryptoJS from 'crypto-js';

export class HashGenerator {
  /**
   * Generate unique hash for transaction deduplication.
   * Priority:
   * 1. Raw SMS body hash — immune to any parsing differences
   * 2. Bank ref number — bank's own unique ID
   * 3. amount + date + bank + type + account — last resort
   */
  static generate(transaction) {
    const {
      amount,
      date,
      bank = 'Unknown',
      type,
      refNumber,
      accountNumber,
      rawSms,
    } = transaction;

    // 1. Best: hash the raw SMS body directly
    // Same SMS always = same hash, regardless of how merchant is parsed/truncated
    if (rawSms && rawSms.trim().length > 0) {
      const normalized = rawSms.trim().toLowerCase().replace(/\s+/g, ' ');
      return CryptoJS.MD5(normalized).toString();
    }

    // 2. Bank's own ref number
    if (refNumber && refNumber.trim()) {
      const input = `${bank}_${refNumber}`;
      return CryptoJS.SHA256(input).toString();
    }

    // 3. Fallback
    const acct = accountNumber ? accountNumber.trim() : '';
    const input = [
      amount.toFixed(2),
      date,
      bank.trim().toLowerCase(),
      type,
      acct,
    ].join('_');

    return CryptoJS.SHA256(input).toString();
  }

  static isValid(hash) {
    return /^[a-f0-9]{32}$/.test(hash) || /^[a-f0-9]{64}$/.test(hash);
  }
}

export default HashGenerator;