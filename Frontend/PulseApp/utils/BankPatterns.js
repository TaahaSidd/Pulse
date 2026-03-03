// /**
//  * Regex patterns for extracting transaction data from Indian bank SMS
//  * Supports: SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, Canara, and UPI apps
//  * UPDATED: Now handles credit transactions (incoming money) properly
//  */

// export const BankPatterns = {
//   amount: [
//     /(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//     /([\d,]+\.?\d*)\s*(?:rs\.?|inr|₹)/i,
//     /(?:amount|amt):\s*(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//     /(?:debited|credited)\s+by\s+([\d,]+\.?\d*)/i,
//   ],

//   date: [
//     /(\d{2}[-/]\d{2}[-/]\d{2,4})/,
//     /(\d{2}-[a-z]{3}-\d{2,4})/i,
//     /on\s+(\d{2}[-/][a-z]{3}[-/]\d{2,4})/i,
//     /on\s+date\s+(\d{2}[a-z]{3}\d{2,4})/i,
//     /(\d{2}[a-z]{3}\d{2,4})/i,
//   ],

//   debit: [
//     /debited|debit|paid|purchase|withdrawn|spent/i,
//   ],
//   credit: [
//     /credited|credit|received|deposited/i,
//   ],

//   // Bank identification
//   banks: {
//     SBI: {
//       identifier: /\bsbi\b|-sbi|state bank/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//         merchant: /trf\s+to\s+([a-z0-9\s&.]+?)(?:\s+refno|\s+ref|\s+if|$)/i,
//         refNumber: /refno\s+(\d+)/i,
//       },
//     },

//     HDFC: {
//       identifier: /\bhdfc\b/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//         merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on|\s+info|\.)/i,
//         refNumber: /(?:ref|txn)(?:\s+(?:no|id))?\.?\s*(\w+)/i,
//       },
//     },

//     ICICI: {
//       identifier: /\bicici\b/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//         merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on|\s+ref)/i,
//         refNumber: /(?:ref|utr)\.?\s*(\w+)/i,
//       },
//     },

//     AXIS: {
//       identifier: /\baxis\b/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//         merchant: /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on)/i,
//       },
//     },

//     KOTAK: {
//       identifier: /\bkotak\b/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//       },
//     },

//     PNB: {
//       identifier: /\bpnb\b|punjab national/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//       },
//     },

//     BOB: {
//       identifier: /\bbob\b|bank of baroda/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//       },
//     },

//     FEDERAL: {
//       identifier: /federal\s*bank|-federal/i,
//       patterns: {
//         debit: /debited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         credit: /credited.*?(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
//         account: /a\/c\s*[x*]*(\d{4})/i,
//         merchant: /(?:to|by)\s+([a-z0-9\s&]+?)(?:\.ref|\s+ref|\.|$)/i,
//         refNumber: /ref\s+no\s+(\d+)/i,
//       },
//     },

//   },

//   // UPI Apps
//   upi: {
//     PHONEPE: {
//       identifier: /phonepe/i,
//       patterns: {
//         debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         merchant: /(?:to|from)\s+([a-z0-9@.]+?)(?:\s+via|\s+upi|\s+ref|\.|$)/i,  // ← Added "via"
//         refNumber: /(?:ref|upi|txn)\.?\s*(\w+)/i,
//       },
//     },

//     GOOGLEPAY: {
//       identifier: /google\s*pay|gpay/i,
//       patterns: {
//         debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         merchant: /(?:to|from)\s+([a-z0-9@.]+?)(?:\s+via|\s+upi|\.|$)/i,  // ← Added "via"
//         refNumber: /upi\s+id:?\s*(\w+)/i,
//       },
//     },

//     PAYTM: {
//       identifier: /paytm/i,
//       patterns: {
//         debit: /paid\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         credit: /received\s+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
//         merchant: /(?:to|from)\s+([a-z0-9@.]+?)(?:\s+via|\.|$)/i,  // ← Added "via"
//       },
//     },
//   },

//   generic: {
//     merchant: [
//       // Debit patterns
//       /trf\s+to\s+([a-z0-9\s&.]+?)(?:\s+refno|\s+ref|\s+if|$)/i,
//       /(?:at|to)\s+([a-z0-9\s&]+?)(?:\s+on|\s+ref|\s+upi|\.|$)/i,
//       /(?:merchant|vendor):\s*([a-z0-9\s&]+?)(?:\s+on|\.)/i,

//       // AutoPay/SIP patterns
//       /autopay\s+for\s+([a-z0-9\s\-&.]+?)(?:\s+-\s+autopay|\s+debit|\s+on|$)/i,
//       /UPI\s+AutoPay\s+for\s+([a-z0-9\s\-&.]+?)(?:\s+-\s+|\.)/i,
//       /scheduled\s+to\s+([a-z0-9\s&]+?)(?:\s+on)/i,
//       /sip\s+to\s+([a-z0-9\s&]+?)(?:\s+of|\s+for|\.)/i,
//       /mandate\s+for\s+([a-z0-9\s&]+?)(?:\s+debit|\.)/i,

//       // ✅ NEW: Credit patterns (for incoming money)
//       /by\s+a\/c\s+linked\s+to\s+mobile\s+([\dX]+)/i,  // Mobile number
//       /from\s+([a-z0-9@.\s]+?)(?:\s+upi|\s+ref|\s+via|\.|$)/i,  // UPI/Name
//       /transfer\s+from\s+([a-z0-9\s]+?)(?:\s+ref|\.|$)/i,  // Transfer from X
//       /salary\s+from\s+([a-z0-9\s]+)/i,  // Salary
//       /refund\s+from\s+([a-z0-9\s]+)/i,  // Refund
//       /([a-z0-9]+@[a-z]+)/i,  // UPI ID pattern (john@paytm)
//     ],
//     refNumber: [
//       /refno\s+(\d+)/i,
//       /(?:ref|reference|txn|transaction|utr|upi|imps)(?:\s+(?:no|id|number))?\.?\s*(\w+)/i,
//     ],
//     account: [
//       /a\/c\s*(?:no\.?)?\s*[x*]*(\d{4,})/i,
//       /account\s*[x*]*(\d{4,})/i,
//     ],
//   },
// };

// export default BankPatterns;


/**
 * BankPatterns.js
 * Regex patterns for Indian bank SMS parsing
 * Fixed: SBI format, date parsing, MF/SIP filtering
 */

/**
 * BankPatterns.js
 * Regex patterns for Indian bank SMS parsing
 * Fixed: SBI format, date parsing, MF/SIP filtering
 */

export const BankPatterns = {

  // ─── Spam / Non-transaction filter ───────────────────────────────────────
  // If SMS matches ANY of these, it's NOT a real transaction
  spam: [
    /nav\s+of/i,                          // Mutual fund NAV updates
    /expense\s+ratio/i,                   // MF expense ratio
    /total\s+expense\s+ratio/i,
    /folio\s+no/i,                        // MF folio
    /units?\s+allot/i,                    // MF unit allotment
    /switch\s+out/i,                      // MF switch
    /redemption\s+proceeds/i,
    /dividend\s+declared/i,
    /step\s+into/i,                       // YONO promo
    /yono\s+experience/i,
    /fraudsters?\s+send/i,               // SBI fraud warning
    /kyc\s+update/i,
    /do\s+not\s+share/i,                 // OTP messages
    /otp\s+for/i,
    /one\s+time\s+password/i,
    /your\s+otp\s+is/i,
    /verification\s+code/i,
    /login\s+otp/i,
    /banking\s+credentials/i,
    /avoid\s+phishing/i,
    /never\s+share/i,
    /call\s+our\s+helpline/i,
    /cibil\s+score/i,                     // Credit score SMS
    /credit\s+score/i,
    /pre.?approved\s+loan/i,             // Loan offers
    /instant\s+approval/i,
    /apply\s+now/i,
    /click\s+here/i,
    /loan\s+offer/i,
    /get\s+a\s+loan/i,
    /personal\s+loan/i,
    /home\s+loan/i,
    /recharge\s+plan/i,                  // Telecom promos
    /data\s+pack/i,
    /roaming\s+pack/i,
    /gb\s+data/i,
    /validity/i,

    // Collect requests / pending approvals — not real transactions yet
    /has\s+requested\s+money\s+on\s+supermoney/i,
    /on\s+approving\s+the\s+request/i,
    /upi.?mandate\s+collect\s+request/i,  // Apple/subscription mandate requests
    /mandate\s+collect\s+request/i,

    // Promo / marketing that slipped through
    /park\s+a\s+part\s+in\s+an?\s+fd/i,
    /earn\s+upto.*interest/i,
    /we\s+have\s+initiated\s+a\s+refund.*promo\s+code/i, // Promo refunds (not real money)
    /salary\?\s+park/i,
  ],

  // ─── Amount patterns ─────────────────────────────────────────────────────
  amount: [
    /(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:rs\.?|inr|₹)/i,
    /(?:amount|amt)[:\s]+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
    /(?:debited|credited)\s+(?:by\s+)?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
    /(?:paid|sent)\s+(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
  ],

  // ─── Date patterns ───────────────────────────────────────────────────────
  date: [
    /(\d{2}[-/]\d{2}[-/]\d{2,4})/,           // DD-MM-YY or DD/MM/YY
    /(\d{2}-[a-z]{3}-\d{2,4})/i,             // DD-MMM-YY
    /on\s+(\d{2}[-/][a-z]{3}[-/]\d{2,4})/i,
    /on\s+date\s+(\d{2}[a-z]{3}\d{2,4})/i,
    /(\d{2}[a-z]{3}\d{2,4})/i,               // DDMmmYY (SBI UPI)
    /(\d{2}-[a-z]{3})/i,                      // DD-MMM (no year, e.g. 05-Feb)
  ],

  // ─── Debit / Credit keywords ─────────────────────────────────────────────
  debit: [
    /\bdebited\b/i,
    /\bdebit\b/i,
    /\bis\s+debited\b/i,
    /\bpaid\b/i,
    /\bpurchase\b/i,
    /\bwithdrawn\b/i,
    /\bspent\b/i,
    /\bcharged\b/i,
    /\btrf\s+to\b/i,                          // SBI "trf to"
    /\byou\s+paid\b/i,                        // PhonePe/GPay
    /\bsent\s+to\b/i,
  ],
  credit: [
    /\bcredited\b/i,
    /\bcredit\b/i,
    /\bis\s+credited\b/i,
    /\breceived\b/i,
    /\bdeposited\b/i,
    /\brefund\b/i,
    /\bsalary\b/i,
    /\bcashback\b/i,
  ],

  // ─── Bank identification ─────────────────────────────────────────────────
  banks: {
    SBI: {
      identifier: /\bsbi\b|-sbi|state\s+bank/i,
      patterns: {
        // "is debited by Rs.450.00 on 05-02-26 and trf to Swiggy"
        merchant: /trf\s+to\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+refno|\s+ref\s*no|\s+if\s+not|\s*\.|$)/i,
        account: /a\/c\s*(?:no\.?)?\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:refno|ref\s*no|imps\s*ref\s*no)\.?\s*(\d+)/i,
      },
    },

    HDFC: {
      identifier: /\bhdfc\b/i,
      patterns: {
        // "Rs.2,499.00 debited from A/c XX1234 on 05-Feb-26 at Amazon.in"
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\s+info|\s+avl|\s+ref|\.|$)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|txn)(?:\s*(?:no|id))?\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    ICICI: {
      identifier: /\bicici\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\s+ref|\.|$)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    AXIS: {
      identifier: /\baxis\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\.|$)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
      },
    },

    KOTAK: {
      identifier: /\bkotak\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\.|$)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
      },
    },

    PNB: {
      identifier: /\bpnb\b|punjab\s+national/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\.|$)/i,
      },
    },

    BOB: {
      identifier: /\bbob\b|bank\s+of\s+baroda/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s|\.|$)/i,
      },
    },

    FEDERAL: {
      identifier: /federal\s*bank|-federal/i,
      patterns: {
        merchant: /(?:to|by)\s+([A-Za-z0-9\s&.'@-]+?)(?:\.?\s*ref|\.|$)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /ref\s+no\.?\s*(\d+)/i,
      },
    },
  },

  // ─── UPI Apps ────────────────────────────────────────────────────────────
  upi: {
    PHONEPE: {
      identifier: /phonepe/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+via|\s+upi|\s+ref|\s+on|\.|$)/i,
        refNumber: /(?:ref|upi|txn)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    GOOGLEPAY: {
      identifier: /google\s*pay|gpay/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+via|\s+upi|\s+on|\.|$)/i,
        refNumber: /upi\s+(?:ref|id)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    PAYTM: {
      identifier: /paytm/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+via|\s+on|\.|$)/i,
      },
    },

    SBIUPI: {
      identifier: /sbi\s*upi|upi\/p2[mp]/i,
      patterns: {
        // "UPI/P2M/123456/Swiggy" or "UPI/P2P/123456/John"
        merchant: /UPI\/P2[MP]\/\d+\/([A-Za-z0-9\s&.'@-]+?)(?:\s*\/|\s*-|\.|$)/i,
        refNumber: /UPI\/P2[MP]\/(\d+)/i,
      },
    },
  },

  // ─── Generic fallback patterns ───────────────────────────────────────────
  generic: {
    merchant: [
      // SBI trf to
      /trf\s+to\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+refno|\s+ref|\s+if|$)/i,
      // UPI P2M/P2P format
      /UPI\/P2[MP]\/\d+\/([A-Za-z0-9\s&.'@-]+?)(?:\/|-|\.|$)/i,
      // "at Merchant" or "to Merchant"
      /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+on\s+|\s+ref|\s+avl|\s+info|\s+www|\.|$)/i,
      // AutoPay/SIP
      /autopay\s+for\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+-\s+autopay|\s+debit|\s+on|$)/i,
      /mandate\s+for\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+debit|\.|$)/i,
      // Salary
      /salary\s+from\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+ref|\.|$)/i,
      // UPI ID
      /([A-Za-z0-9.]+@[A-Za-z]+)/i,
      // "from XYZ" credit
      /from\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+upi|\s+ref|\s+on|\s+via|\.|$)/i,
    ],

    refNumber: [
      /(?:refno|ref\s*no|imps\s*ref\s*no)\.?\s*(\d+)/i,
      /(?:ref|reference|txn|transaction|utr|upi|imps)(?:\s+(?:no|id|number))?\.?\s*:?\s*([A-Za-z0-9]+)/i,
    ],

    account: [
      /[Aa]\/[Cc]\s*(?:no\.?)?\s*[xX*]*(\d{4,})/i,
      /(?:account|acct?)[\s#]*[xX*]*(\d{4,})/i,
      /[xX]{4,}\s*(\d{4})/i,
    ],
  },
};

export default BankPatterns;