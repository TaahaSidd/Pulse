import { format, parse } from 'date-fns';
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
        amount,
        type,
        date,
        merchant,
        category,
        bank,
        transactionMethod,
        accountNumber,
        refNumber,
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
        metadata: {
          parsedAt: new Date().toISOString(),
          parserVersion: '1.0.0',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rawSms: smsText,
      };
    }
  }


  static extractAmount(smsText) {
    for (const pattern of BankPatterns.amount) {
      const match = smsText.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    throw new Error('Could not extract amount from SMS');
  }

  static extractType(smsText) {
    for (const pattern of BankPatterns.debit) {
      if (pattern.test(smsText)) {
        return 'debit';
      }
    }
    for (const pattern of BankPatterns.credit) {
      if (pattern.test(smsText)) {
        return 'credit';
      }
    }
    return 'unknown';
  }

  static extractDate(smsText) {
    for (const pattern of BankPatterns.date) {
      const match = smsText.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];

          // Handle DD-MM-YY or DD/MM/YY format
          if (/\d{2}[-/]\d{2}[-/]\d{2,4}/.test(dateStr)) {
            const parts = dateStr.split(/[-/]/);
            const day = parts[0];
            const month = parts[1];
            let year = parts[2];

            if (year.length === 2) {
              year = '20' + year;
            }

            return `${year}-${month}-${day}`;
          }

          // Handle DD-MMM-YY format (with separator)
          if (/\d{2}-[a-z]{3}-\d{2,4}/i.test(dateStr)) {
            const parsed = parse(dateStr, 'dd-MMM-yy', new Date());
            return format(parsed, 'yyyy-MM-dd');
          }

          // ✅ NEW: Handle DDMmmYY format (SBI UPI - no separator)
          // Examples: 07Jan26, 28Nov25, 08Oct25
          if (/\d{2}[a-z]{3}\d{2,4}/i.test(dateStr)) {
            const day = dateStr.substring(0, 2);
            const month = dateStr.substring(2, 5);
            let year = dateStr.substring(5);

            // Convert 2-digit year to 4-digit
            if (year.length === 2) {
              year = '20' + year;
            }

            // Parse using date-fns
            const fullDateStr = `${day}-${month}-${year}`;
            const parsed = parse(fullDateStr, 'dd-MMM-yyyy', new Date());
            return format(parsed, 'yyyy-MM-dd');
          }
        } catch (error) {
          console.warn('Date parsing error:', error);
        }
      }
    }

    // Fallback to current date
    return format(new Date(), 'yyyy-MM-dd');
  }

  static identifyBank(smsText) {
    for (const [bankName, config] of Object.entries(BankPatterns.banks)) {
      if (config.identifier.test(smsText)) {
        return bankName;
      }
    }

    for (const [appName, config] of Object.entries(BankPatterns.upi)) {
      if (config.identifier.test(smsText)) {
        return appName;
      }
    }

    return 'Unknown';
  }

  static extractMerchant(smsText, bank) {
    if (bank !== 'Unknown') {
      const bankConfig = BankPatterns.banks[bank] || BankPatterns.upi[bank];
      if (bankConfig && bankConfig.patterns.merchant) {
        const match = smsText.match(bankConfig.patterns.merchant);
        if (match) {
          return match[1].trim();
        }
      }
    }

    for (const pattern of BankPatterns.generic.merchant) {
      const match = smsText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Unknown';
  }

  static extractAccountNumber(smsText) {
    for (const pattern of BankPatterns.generic.account) {
      const match = smsText.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  static extractRefNumber(smsText, bank) {
    if (bank !== 'Unknown') {
      const bankConfig = BankPatterns.banks[bank] || BankPatterns.upi[bank];
      if (bankConfig && bankConfig.patterns.refNumber) {
        const match = smsText.match(bankConfig.patterns.refNumber);
        if (match) {
          return match[1];
        }
      }
    }

    for (const pattern of BankPatterns.generic.refNumber) {
      const match = smsText.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  static identifyMethod(smsText) {
    if (/upi|phonepe|gpay|paytm/i.test(smsText)) {
      return 'UPI';
    }
    if (/card|atm|pos/i.test(smsText)) {
      return 'Card';
    }
    if (/transfer|neft|imps|rtgs/i.test(smsText)) {
      return 'Bank Transfer';
    }
    return 'Other';
  }

  static isTransactionSMS(smsText) {
    const hasAmount = BankPatterns.amount.some(p => p.test(smsText));
    const hasType = [...BankPatterns.debit, ...BankPatterns.credit].some(p => p.test(smsText));
    return hasAmount && hasType;
  }
}

export default SmsParserService;