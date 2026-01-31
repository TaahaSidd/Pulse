/**
 * Regex patterns for extracting transaction data from Indian bank SMS
 * Supports: SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, Canara, and UPI apps
 * UPDATED: Now handles SBI UPI format without currency symbols
 */

export const BankPatterns = {
  // Amount patterns (handles Rs., Rs, INR, ₹, and plain numbers)
  amount: [
    /(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:rs\.?|inr|₹)/i,
    /(?:amount|amt):\s*(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
    // ✅ SBI UPI format: "debited by 30" or "credited by 100"
    /(?:debited|credited)\s+by\s+([\d,]+\.?\d*)/i,
  ],

  // Date patterns (DD-MM-YY, DD/MM/YY, DD-Mon-YY, DDMmmYY, etc.)
  date: [
    /(\d{2}[-/]\d{2}[-/]\d{2,4})/,
    /(\d{2}-[a-z]{3}-\d{2,4})/i,
    /on\s+(\d{2}[-/][a-z]{3}[-/]\d{2,4})/i,
    // ✅ SBI UPI format: "on date 07Jan26" (no separators)
    /on\s+date\s+(\d{2}[a-z]{3}\d{2,4})/i,
    /(\d{2}[a-z]{3}\d{2,4})/i,
  ],

  // Transaction type
  debit: [
    /debited|debit|paid|purchase|withdrawn|spent/i,
  ],
  credit: [
    /credited|credit|received|deposited/i,
  ],

  // Bank identification
  banks: {
    SBI: {
      identifier: /\bsbi\b|-sbi|state bank/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
        // ✅ Updated merchant pattern for "trf to NAME"
        merchant: /trf\s+to\s+([a-z0-9\s&.]+?)(?:\s+refno|\s+ref|\s+if|$)/i,
        refNumber: /refno\s+(\d+)/i,
      },
    },

    HDFC: {
      identifier: /\bhdfc\b/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
        merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on|\s+info|\.)/i,
        refNumber: /(?:ref|txn)(?:\s+(?:no|id))?\.?\s*(\w+)/i,
      },
    },

    ICICI: {
      identifier: /\bicici\b/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
        merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on|\s+ref)/i,
        refNumber: /(?:ref|utr)\.?\s*(\w+)/i,
      },
    },

    AXIS: {
      identifier: /\baxis\b/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
        merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on)/i,
      },
    },

    KOTAK: {
      identifier: /\bkotak\b/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
      },
    },

    PNB: {
      identifier: /\bpnb\b|punjab national/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
      },
    },

    BOB: {
      identifier: /\bbob\b|bank of baroda/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
      },
    },

    FEDERAL: {
      identifier: /federal\s*bank|-federal/i,
      patterns: {
        debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
        account: /a\/c\s*[x*]*(\d{4})/i,
        merchant: /(?:to|by)\s+([a-z0-9\s&]+?)(?:\.ref|\s+ref|\.|$)/i,
        refNumber: /ref\s+no\s+(\d+)/i,
      },
    },

  },

  // UPI Apps
  upi: {
    PHONEPE: {
      identifier: /phonepe/i,
      patterns: {
        debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        merchant: /(?:to|from)\s+([a-z0-9\s@]+?)(?:\s+upi|\s+ref|\.|$)/i,
        refNumber: /(?:ref|upi|txn)\.?\s*(\w+)/i,
      },
    },

    GOOGLEPAY: {
      identifier: /google\s*pay|gpay/i,
      patterns: {
        debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        merchant: /(?:to|from)\s+([a-z0-9\s@]+?)(?:\s+upi|\.|$)/i,
        refNumber: /upi\s+id:?\s*(\w+)/i,
      },
    },

    PAYTM: {
      identifier: /paytm/i,
      patterns: {
        debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
        merchant: /(?:to|from)\s+([a-z0-9\s@]+?)(?:\.|$)/i,
      },
    },
  },

  // Generic patterns as fallback
  generic: {
    merchant: [
      /trf\s+to\s+([a-z0-9\s&.]+?)(?:\s+refno|\s+ref|\s+if|$)/i, // SBI UPI transfers
      /(?:at|to|from)\s+([a-z0-9\s&]+?)(?:\s+on|\s+ref|\s+upi|\.|$)/i,
      /(?:merchant|vendor):\s*([a-z0-9\s&]+?)(?:\s+on|\.)/i,
    ],
    refNumber: [
      /refno\s+(\d+)/i, // SBI format
      /(?:ref|reference|txn|transaction|utr|upi)(?:\s+(?:no|id|number))?\.?\s*(\w+)/i,
    ],
    account: [
      /a\/c\s*(?:no\.?)?\s*[x*]*(\d{4,})/i,
      /account\s*[x*]*(\d{4,})/i,
    ],
  },
};

export default BankPatterns;