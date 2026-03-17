import { format, parse, isValid } from 'date-fns';
import { BankPatterns } from '../utils/BankPatterns';
import { CategoryMapper } from '../utils/CategoryMapper';
import { HashGenerator } from '../utils/HashGenerator';
import { PrivacyScrubber } from '../utils/PrivacyScrubber';

export class SmsParserService {

  static parse(smsText) {
    if (!smsText || smsText.trim().length === 0) {
      throw new Error('SMS text is empty');
    }

    try {
      const amount = this.extractAmount(smsText);
      const type = this.extractType(smsText);
      const date = this.extractDate(smsText);
      const bank = this.identifyBank(smsText);
      const merchant = this.extractMerchant(smsText, bank);
      const accountNumber = this.extractAccountNumber(smsText);
      const refNumber = this.extractRefNumber(smsText, bank);
      const transactionMethod = this.identifyMethod(smsText);
      const category = CategoryMapper.categorize(merchant, smsText, type);

      const baseTransaction = {
        amount, type, date, merchant, category, bank,
        transactionMethod, accountNumber, refNumber,
        rawSms: smsText,
        timestamp: new Date().toISOString(),
      };

      const hash = HashGenerator.generate(baseTransaction);
      baseTransaction.hash = hash;

      const localTransaction = PrivacyScrubber.prepareForLocalStorage(baseTransaction);
      const cloudTransaction = PrivacyScrubber.scrubForBackend(baseTransaction);

      return {
        success: true,
        local: localTransaction,
        cloud: cloudTransaction,
        metadata: { parsedAt: new Date().toISOString(), parserVersion: '3.0.0' },
      };
    } catch (error) {
      return { success: false, error: error.message, rawSms: smsText };
    }
  }

  static extractAmount(smsText) {
    for (const pattern of BankPatterns.amount) {
      const match = smsText.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0 && amount < 10000000) return amount;
      }
    }
    throw new Error('Could not extract amount from SMS');
  }

  static extractType(smsText) {
    for (const pattern of BankPatterns.debit) {
      if (pattern.test(smsText)) return 'debit';
    }
    for (const pattern of BankPatterns.credit) {
      if (pattern.test(smsText)) return 'credit';
    }
    return 'unknown';
  }

  static extractDate(smsText) {
    for (const pattern of BankPatterns.date) {
      const match = smsText.match(pattern);
      if (!match) continue;
      try {
        const dateStr = match[1];

        if (/^\d{2}[-/]\d{2}[-/]\d{2,4}$/.test(dateStr)) {
          const parts = dateStr.split(/[-/]/);
          let year = parseInt(parts[2]);
          if (year < 100) year += 2000;
          const d = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (isValid(d)) return format(d, 'yyyy-MM-dd');
        }

        if (/^\d{2}-[a-z]{3}-?\d{2,4}$/i.test(dateStr)) {
          const normalized = dateStr.replace(/(\d{2})-([a-z]{3})-(\d{2})$/i, (_, d, m, y) => `${d}-${m}-20${y}`);
          const parsed = parse(normalized, 'dd-MMM-yyyy', new Date());
          if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
          const parsed2 = parse(dateStr, 'dd-MMM-yyyy', new Date());
          if (isValid(parsed2)) return format(parsed2, 'yyyy-MM-dd');
        }

        if (/^\d{2}[a-z]{3}\d{2,4}$/i.test(dateStr)) {
          const day = dateStr.substring(0, 2);
          const mon = dateStr.substring(2, 5);
          let yr = dateStr.substring(5);
          if (yr.length === 2) yr = '20' + yr;
          const parsed = parse(`${day}-${mon}-${yr}`, 'dd-MMM-yyyy', new Date());
          if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
        }

        if (/^\d{2}-[a-z]{3}$/i.test(dateStr)) {
          const parsed = parse(`${dateStr}-${new Date().getFullYear()}`, 'dd-MMM-yyyy', new Date());
          if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
        }
      } catch (e) { /* skip */ }
    }
    return format(new Date(), 'yyyy-MM-dd');
  }

  static identifyBank(smsText) {
    for (const [name, config] of Object.entries(BankPatterns.banks)) {
      if (config.identifier.test(smsText)) return name;
    }
    for (const [name, config] of Object.entries(BankPatterns.upi)) {
      if (config.identifier.test(smsText)) return name;
    }
    return 'Unknown';
  }

  static extractMerchant(smsText, bank) {
    if (bank !== 'Unknown') {
      const bankConfig = BankPatterns.banks[bank] || BankPatterns.upi[bank];
      if (bankConfig?.patterns?.merchant) {
        const match = smsText.match(bankConfig.patterns.merchant);
        if (match?.[1]) return this.cleanMerchant(match[1]);
      }
    }
    for (const pattern of BankPatterns.generic.merchant) {
      const match = smsText.match(pattern);
      if (match?.[1]) {
        const cleaned = this.cleanMerchant(match[1]);
        if (cleaned && cleaned.length > 1) return cleaned;
      }
    }
    if (/neft/i.test(smsText)) return 'NEFT Transfer';
    if (/imps/i.test(smsText)) return 'IMPS Transfer';
    if (/rtgs/i.test(smsText)) return 'RTGS Transfer';
    if (/upi/i.test(smsText)) return 'UPI Transfer';
    return 'Unknown';
  }

  static cleanMerchant(name) {
    if (!name) return 'Unknown';
    let c = name.trim();

    // Remove VPA prefix
    c = c.replace(/^VPA\s+/i, '');

    // Handle UPI IDs
    if (c.includes('@')) {
      const [handle, domain] = c.split('@');
      const h = handle.toLowerCase();
      const d = (domain || '').toLowerCase();
      if (h.startsWith('gpay') || d.includes('okbiz') || d.includes('okhdfcbank') || d.includes('okaxis')) return 'GPay Merchant';
      if (h.startsWith('paytmqr') || d === 'paytm') return 'Paytm';
      if (d === 'ybl' || d === 'ibl') {
        const humanHandle = handle.replace(/[0-9]/g, '').trim();
        return humanHandle.length > 2 ? humanHandle : 'PhonePe';
      }
      if (d.includes('airtel')) return 'Airtel';
      if (d.includes('pthdfc') || d.includes('hdfcbank')) return 'HDFC Merchant';
      if (d.includes('idfcbank')) return 'IDFC Merchant';
      const handleCleaned = handle.replace(/[0-9]/g, '').replace(/[-_.]/g, ' ').trim();
      return handleCleaned.length > 3 ? handleCleaned : c;
    }

    // PennyWise-inspired suffix cleaning
    c = c.replace(/\s*\(.*?\)\s*$/, '');           // trailing parentheses
    c = c.replace(/\s+Ref\s+No.*/i, '');           // Ref No...
    c = c.replace(/\s+on\s+\d{2}.*/i, '');         // on DD...
    c = c.replace(/\s+UPI.*/i, '');                // UPI...
    c = c.replace(/\s+at\s+\d{2}:\d{2}.*/i, '');  // at HH:MM...
    c = c.replace(/\s*-\s*$/, '');                 // trailing dash
    c = c.replace(/\s+PVT\.?\s*LTD\.?$/i, '');    // Pvt Ltd
    c = c.replace(/\s+PRIVATE\s+LIMITED$/i, '');   // Private Limited
    c = c.replace(/\s+LIMITED$/i, '');             // Limited
    c = c.replace(/\s+LTD\.?$/i, '');             // Ltd

    return c.replace(/\s+/g, ' ').trim().substring(0, 50);
  }

  static extractAccountNumber(smsText) {
    for (const pattern of BankPatterns.generic.account) {
      const match = smsText.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static extractRefNumber(smsText, bank) {
    if (bank !== 'Unknown') {
      const bankConfig = BankPatterns.banks[bank] || BankPatterns.upi[bank];
      if (bankConfig?.patterns?.refNumber) {
        const match = smsText.match(bankConfig.patterns.refNumber);
        if (match) return match[1];
      }
    }
    for (const pattern of BankPatterns.generic.refNumber) {
      const match = smsText.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static identifyMethod(smsText) {
    if (/upi|phonepe|gpay|paytm|bhim/i.test(smsText)) return 'UPI';
    if (/\bneft\b|\brtgs\b|\bimps\b/i.test(smsText)) return 'Bank Transfer';
    if (/\bcard\b|\batm\b|\bpos\b|\bswipe\b/i.test(smsText)) return 'Card';
    return 'Other';
  }

  static isTransactionSMS(smsText) {
    if (!smsText) return false;
    if (BankPatterns.spam.some(p => p.test(smsText))) return false;
    const hasAmount = BankPatterns.amount.some(p => p.test(smsText));
    const hasType = [...BankPatterns.debit, ...BankPatterns.credit].some(p => p.test(smsText));
    return hasAmount && hasType;
  }
}

export default SmsParserService;