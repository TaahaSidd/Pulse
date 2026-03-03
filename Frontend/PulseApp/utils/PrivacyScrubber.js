/**
 * Remove sensitive personal information before sending to backend
 * Protects: Names, Full account numbers, Personal identifiers
 */

export class PrivacyScrubber {
  /**
   * Clean merchant name - handle phone numbers, UPI IDs, and personal names
   */
  static cleanMerchant(merchant, smsText = '', type = 'debit') {
    if (!merchant || merchant === 'Unknown') {
      // Don't return "Unknown Merchant" - let it stay as null/Unknown
      // So CategoryMapper can handle it properly
      return merchant || 'Unknown';
    }

    const lower = smsText.toLowerCase();

    // Handle credit transactions (incoming money)
    if (type === 'credit') {
      // If it's a phone number, mask it
      if (/^\d{10,}$/.test(merchant.trim())) {
        return this.maskPhoneNumber(merchant);
      }

      // If it's a UPI ID, keep the handle but mask the username
      if (merchant.includes('@')) {
        return this.maskUPIID(merchant);
      }

      // If SMS mentions salary
      if (lower.includes('salary')) {
        return merchant.trim(); // Keep company name as is
      }

      // If SMS mentions refund
      if (lower.includes('refund')) {
        return merchant.trim(); // Keep merchant name
      }

      // If it looks like a person's name (transfer from friend/family)
      if (this.looksLikePersonName(merchant)) {
        return 'Personal Transfer';
      }

      // For IMPS/NEFT with linked mobile
      if (lower.includes('linked to mobile')) {
        return 'Bank Transfer';
      }
    }

    // For debit transactions, clean up merchant name
    let clean = merchant.trim();

    // Remove common suffixes
    clean = clean.replace(/\s+(pvt\.?|ltd\.?|limited|inc\.?|llp)$/i, '');

    // Capitalize properly
    clean = this.capitalizeWords(clean);

    return clean;
  }

  /**
   * Check if text looks like a person's name
   */
  static looksLikePersonName(text) {
    // Pattern: FirstName LastName (optionally MiddleName)
    const personalNamePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
    return personalNamePattern.test(text.trim());
  }

  /**
   * Mask phone number - keep last 4 digits
   */
  static maskPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) {
      return `***${digits}`;
    }
    const lastFour = digits.slice(-4);
    return `***XXX${lastFour}`;
  }

  /**
   * Mask UPI ID - keep domain, mask username
   */
  static maskUPIID(upiId) {
    const [username, domain] = upiId.split('@');
    if (!domain) {
      return upiId; // Invalid UPI ID, return as is
    }

    if (username.length <= 3) {
      return `***@${domain}`;
    }

    const masked = username.slice(0, 2) + '***' + username.slice(-1);
    return `${masked}@${domain}`;
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
      merchant: this.cleanMerchant(transaction.merchant, transaction.rawSms, transaction.type),
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
        'Salary': 'Salary Received',
        'Transfer': 'Money Received',
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