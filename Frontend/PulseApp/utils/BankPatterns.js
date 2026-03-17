export const BankPatterns = {

  spam: [
    /nav\s+of/i,
    /expense\s+ratio/i,
    /total\s+expense\s+ratio/i,
    /folio\s+no/i,
    /units?\s+allot/i,
    /switch\s+out/i,
    /redemption\s+proceeds/i,
    /dividend\s+declared/i,
    /step\s+into/i,
    /yono\s+experience/i,
    /fraudsters?\s+send/i,
    /kyc\s+update/i,
    /do\s+not\s+share/i,
    /otp\s+for/i,
    /one\s+time\s+password/i,
    /your\s+otp\s+is/i,
    /verification\s+code/i,
    /login\s+otp/i,
    /banking\s+credentials/i,
    /avoid\s+phishing/i,
    /never\s+share/i,
    /call\s+our\s+helpline/i,
    /cibil\s+score/i,
    /credit\s+score/i,
    /pre.?approved\s+loan/i,
    /instant\s+approval/i,
    /apply\s+now/i,
    /click\s+here/i,
    /loan\s+offer/i,
    /get\s+a\s+loan/i,
    /personal\s+loan/i,
    /home\s+loan/i,
    /recharge\s+plan/i,
    /data\s+pack/i,
    /roaming\s+pack/i,
    /gb\s+data/i,
    /validity/i,
    /has\s+requested\s+money\s+on\s+supermoney/i,
    /on\s+approving\s+the\s+request/i,
    /upi.?mandate\s+collect\s+request/i,
    /mandate\s+collect\s+request/i,
    /park\s+a\s+part\s+in\s+an?\s+fd/i,
    /earn\s+upto.*interest/i,
    /salary\?\s+park/i,
  ],

  amount: [
    /(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:rs\.?|inr|₹)/i,
    /(?:amount|amt)[:\s]+(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
    /(?:debited|credited)\s+(?:by\s+)?(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)/i,
    /(?:paid|sent)\s+(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)/i,
  ],

  date: [
    /(\d{2}[-/]\d{2}[-/]\d{2,4})/,
    /(\d{2}-[a-z]{3}-\d{2,4})/i,
    /on\s+(\d{2}[-/][a-z]{3}[-/]\d{2,4})/i,
    /on\s+date\s+(\d{2}[a-z]{3}\d{2,4})/i,
    /(\d{2}[a-z]{3}\d{2,4})/i,
    /(\d{2}-[a-z]{3})/i,
  ],

  debit: [
    /\bdebited\b/i,
    /\bdebit\b/i,
    /\bis\s+debited\b/i,
    /\bpaid\b/i,
    /\bpurchase\b/i,
    /\bwithdrawn\b/i,
    /\bspent\b/i,
    /\bcharged\b/i,
    /\btrf\s+to\b/i,
    /\byou\s+paid\b/i,
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

  banks: {
    SBI: {
      identifier: /\bsbi\b|-sbi|state\s+bank/i,
      patterns: {
        merchant: /trf\s+to\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+refno|\s+ref\s*no|\s+if\s+not|\s*\.|$)/i,
        account: /a\/c\s*(?:no\.?)?\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:refno|ref\s*no|imps\s*ref\s*no)\.?\s*(\d+)/i,
      },
    },

    HDFC: {
      identifier: /\bhdfc\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\s+info|\s+avl|\s+ref|\s+www|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|txn)(?:\s*(?:no|id))?\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    ICICI: {
      identifier: /\bicici\b/i,
      patterns: {
        // Lookahead instead of alternation with $ — prevents over-capture
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\s+ref|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    AXIS: {
      identifier: /\baxis\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    KOTAK: {
      identifier: /\bkotak\b/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    PNB: {
      identifier: /\bpnb\b|punjab\s+national/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    BOB: {
      identifier: /\bbob\b|bank\s+of\s+baroda/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    FEDERAL: {
      identifier: /federal\s*bank|-federal/i,
      patterns: {
        merchant: /(?:to|by)\s+([A-Za-z0-9\s&.'@-]+?)(?=\.?\s*ref|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /ref\s+no\.?\s*(\d+)/i,
      },
    },

    // ── New banks ─────────────────────────────────────────────────────────

    CANARA: {
      identifier: /canara\s*bank|-cnrb/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    UNION: {
      identifier: /union\s*bank|-ubin/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    IDFC: {
      identifier: /\bidfc\b|-idfcfb/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\s+ref|\.)/i,
        account: /[Aa]\/[Cc]\s*[xX*]*(\d{4,})/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    INDUSIND: {
      identifier: /indusind/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    YES: {
      identifier: /yes\s*bank|-yesb/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    BANDHAN: {
      identifier: /bandhan\s*bank|-bdbl/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    BOI: {
      identifier: /bank\s+of\s+india|-bkid/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    IOB: {
      identifier: /indian\s+overseas\s+bank|-ioba/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    UCO: {
      identifier: /\buco\s*bank\b|-ucba/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    RBL: {
      identifier: /\brbl\s*bank\b|-ratn/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    CENTRAL: {
      identifier: /central\s*bank\s*of\s*india|-cbin/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    INDIAN: {
      identifier: /\bindian\s+bank\b|-idib/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    SOUTH_INDIAN: {
      identifier: /south\s+indian\s+bank|-sibl/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    KARNATAKA: {
      identifier: /karnataka\s*bank|-karb/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    SARASWAT: {
      identifier: /saraswat\s*bank/i,
      patterns: {
        merchant: /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\.)/i,
        refNumber: /(?:ref|utr)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },
  },

  upi: {
    PHONEPE: {
      identifier: /phonepe/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+upi|\s+ref|\s+on|\.)/i,
        refNumber: /(?:ref|upi|txn)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    GOOGLEPAY: {
      identifier: /google\s*pay|gpay/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+upi|\s+on|\.)/i,
        refNumber: /upi\s+(?:ref|id)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    PAYTM: {
      identifier: /paytm/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
      },
    },

    SBIUPI: {
      identifier: /sbi\s*upi|upi\/p2[mp]/i,
      patterns: {
        merchant: /UPI\/P2[MP]\/\d+\/([A-Za-z0-9\s&.'@-]+?)(?:\s*\/|\s*-|\.|$)/i,
        refNumber: /UPI\/P2[MP]\/(\d+)/i,
      },
    },

    JUPITER: {
      identifier: /jupiter/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
        refNumber: /(?:ref|upi|txn)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    FI: {
      identifier: /\bfi\s+money\b|\bfi\b.*\bbank\b/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
        refNumber: /(?:ref|upi|txn)\.?\s*:?\s*([A-Za-z0-9]+)/i,
      },
    },

    SLICE: {
      identifier: /slice/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
      },
    },

    CRED: {
      identifier: /\bcred\b/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
      },
    },

    NAVI: {
      identifier: /\bnavi\b/i,
      patterns: {
        merchant: /(?:to|from)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+via|\s+on|\.)/i,
      },
    },
  },

  generic: {
    merchant: [
      /trf\s+to\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+refno|\s+ref|\s+if|$)/i,
      /UPI\/P2[MP]\/\d+\/([A-Za-z0-9\s&.'@-]+?)(?:\/|-|\.|$)/i,
      /(?:\bat\b|\bto\b)\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+on\s|\s+ref|\s+avl|\s+info|\s+www|\.)/i,
      /autopay\s+for\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+-\s+autopay|\s+debit|\s+on|$)/i,
      /mandate\s+for\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+debit|\.|$)/i,
      /salary\s+from\s+([A-Za-z0-9\s&.'@-]+?)(?:\s+ref|\.|$)/i,
      /([A-Za-z0-9.]+@[A-Za-z]+)/i,
      /from\s+([A-Za-z0-9\s&.'@-]+?)(?=\s+upi|\s+ref|\s+on|\s+via|\.)/i,
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