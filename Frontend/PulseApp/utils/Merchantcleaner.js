/**
 * Clean and normalize merchant names from SMS
 * Handles: VPA cleanup, "via" removal, proper capitalization
 */

export class MerchantCleaner {
    /**
     * Known VPA to Merchant name mapping
     */
    static vpaMapping = {
        // Food & Dining
        'swiggy': 'Swiggy',
        'zomato': 'Zomato',
        'zomantoonlineord': 'Zomato',
        'dominos': 'Dominos',
        'pizzahut': 'Pizza Hut',

        // Shopping
        'amazon': 'Amazon',
        'flipkart': 'Flipkart',
        'myntra': 'Myntra',
        'paytmmall': 'Paytm Mall',

        // Entertainment
        'netflix': 'Netflix',
        'primevideoind': 'Amazon Prime',
        'hotstar': 'Hotstar',
        'spotify': 'Spotify',

        // Transport
        'uber': 'Uber',
        'olacabs': 'Ola',
        'rapido': 'Rapido',

        // Utilities
        'phonepe': 'PhonePe',
        'googlepay': 'Google Pay',
        'paytm': 'Paytm',

        // Add more as needed
    };

    /**
     * Clean merchant name
     */
    static clean(merchant) {
        if (!merchant || merchant === 'Unknown') {
            return 'Unknown';
        }

        let cleaned = merchant.trim();

        // 1. Remove "via PhonePe/Google Pay/Paytm" etc.
        cleaned = cleaned.replace(/\s+via\s+(phonepe|google\s*pay|paytm|gpay).*/i, '');

        // 2. Handle VPA format (name@bank)
        if (cleaned.includes('@')) {
            cleaned = this.cleanVPA(cleaned);
        }

        // 3. Remove common suffixes
        cleaned = cleaned.replace(/\s+(pvt\.?|ltd\.?|limited|inc\.?|llp|india|pvt\s*ltd)$/i, '');

        // 4. Remove merchant codes/IDs (numbers at the end)
        cleaned = cleaned.replace(/\s+\d{4,}$/g, '');

        // 5. Trim whitespace
        cleaned = cleaned.trim();

        // 6. Capitalize properly
        cleaned = this.capitalize(cleaned);

        return cleaned;
    }

    /**
     * Clean VPA (UPI ID) to extract merchant name
     */
    static cleanVPA(vpa) {
        // Extract username part before @
        const [username, domain] = vpa.split('@');

        if (!username) {
            return vpa;
        }

        // Check if it's a known merchant VPA
        const usernameLower = username.toLowerCase();

        // Check exact matches first
        if (this.vpaMapping[usernameLower]) {
            return this.vpaMapping[usernameLower];
        }

        // Check partial matches (e.g., "zomantoonlineord" contains "zomato")
        for (const [key, value] of Object.entries(this.vpaMapping)) {
            if (usernameLower.includes(key)) {
                return value;
            }
        }

        // Check if it looks like a personal UPI (short, lowercase, numbers)
        if (this.looksLikePersonalVPA(username)) {
            // It's a person - return masked version
            return this.maskPersonalVPA(username, domain);
        }

        // It's a business VPA but not in our mapping
        // Clean it up and return
        return this.capitalize(username);
    }

    /**
     * Check if VPA looks like a personal account (not a business)
     */
    static looksLikePersonalVPA(username) {
        // Personal VPAs are usually:
        // - Short (< 15 chars)
        // - Mix of letters and numbers
        // - All lowercase or mixed case
        // - No brand-like patterns

        if (username.length > 15) {
            return false; // Likely a business
        }

        // Has numbers mixed in (common for personal accounts)
        const hasNumbers = /\d/.test(username);

        // Common personal patterns
        const personalPatterns = [
            /^\d+$/,  // All numbers (phone number)
            /^[a-z]+\d+$/,  // name123
            /^\d+[a-z]+$/,  // 123name
            /^[a-z]{1,10}$/,  // Short single word (firstname)
        ];

        return personalPatterns.some(pattern => pattern.test(username.toLowerCase()));
    }

    /**
     * Mask personal VPA for privacy
     */
    static maskPersonalVPA(username, domain) {
        if (username.length <= 3) {
            return `***@${domain || 'upi'}`;
        }

        const masked = username.slice(0, 2) + '***' + username.slice(-1);
        return `${masked}@${domain || 'upi'}`;
    }

    /**
     * Capitalize merchant name properly
     */
    static capitalize(str) {
        // Special cases - all caps
        const allCaps = ['ATM', 'UPI', 'NEFT', 'IMPS', 'RTGS'];

        if (allCaps.includes(str.toUpperCase())) {
            return str.toUpperCase();
        }

        // Title case for normal names
        return str
            .toLowerCase()
            .split(' ')
            .map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    /**
     * Add new VPA mapping (for user to customize)
     */
    static addVPAMapping(vpa, merchantName) {
        this.vpaMapping[vpa.toLowerCase()] = merchantName;
    }
}

export default MerchantCleaner;