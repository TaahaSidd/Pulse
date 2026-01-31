/**
 * Remove sensitive personal information before sending to backend
 * Protects: Names, Full account numbers, Personal identifiers
 */

export class PrivacyScrubber {
  /**
   * Clean merchant name - remove personal names
   */
  static cleanMerchant(merchant, smsText = '') {
    if (!merchant || merchant === 'Unknown') {
      return 'Unknown Merchant';
    }

    // If it looks like a person's name (transfer from), make it generic
    if (smsText.toLowerCase().includes('transfer from')) {
      return 'Income Transfer';
    }

    // If merchant contains common personal name patterns
    const personalNamePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
    if (personalNamePattern.test(merchant.trim())) {
      return 'Personal Transfer';
    }

    // Clean up merchant name
    let clean = merchant.trim();

    // Remove common suffixes
    clean = clean.replace(/\s+(pvt\.?|ltd\.?|limited|inc\.?|llp)$/i, '');

    // Capitalize properly
    clean = this.capitalizeWords(clean);

    return clean;
  }

  /**
   * Mask account number - keep only last 4 digits
   */
  static maskAccountNumber(accountNumber) {
    if (!accountNumber) {
      return null;
    }

    const digits = accountNumber.replace(/\D/g, '');

    if (digits.length <= 4) {
      return `XX${digits}`;
    }

    const lastFour = digits.slice(-4);
    return `XXXX${lastFour}`;
  }

  /**
   * Remove reference number (keep it local only)
   */
  static shouldIncludeRefNumber() {
    return false; // Never send to backend
  }

  /**
   * Create clean transaction object for backend
   */
  static scrubForBackend(transaction) {
    return {
      hash: transaction.hash,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      merchant: this.cleanMerchant(transaction.merchant, transaction.rawSms),
      category: transaction.category,
      bank: transaction.bank,
      transactionMethod: transaction.transactionMethod,
      timestamp: transaction.timestamp,
      // EXCLUDE: rawSms, senderName, accountNumber, refNumber
    };
  }

  /**
   * Create full transaction object for local storage
   */
  static prepareForLocalStorage(transaction) {
    return {
      ...transaction,
      // Mask account number even for local (user-facing display)
      accountNumberMasked: this.maskAccountNumber(transaction.accountNumber),
    };
  }

  /**
   * Helper: Capitalize words properly
   */
  static capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Detect if text contains sensitive personal information
   */
  static hasSensitiveInfo(text) {
    const patterns = [
      /\b\d{12,16}\b/, // Card numbers
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like patterns
      /password|pin|cvv|otp/i, // Security terms
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Generic transaction labels for common types
   */
  static getGenericLabel(type, category) {
    const labels = {
      credit: {
        'Income': 'Income Transfer',
        'Refund': 'Refund Received',
        'default': 'Payment Received',
      },
      debit: {
        'Food & Dining': 'Food Purchase',
        'Shopping': 'Shopping',
        'Travel & Transport': 'Travel Expense',
        'Bills & Utilities': 'Bill Payment',
        'default': 'Payment',
      },
    };

    const typeLabels = labels[type] || labels.debit;
    return typeLabels[category] || typeLabels.default;
  }
}

export default PrivacyScrubber;