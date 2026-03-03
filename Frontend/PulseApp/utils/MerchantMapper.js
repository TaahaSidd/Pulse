/**
 * MerchantMapper.js
 * Maps popular Indian merchants to brand colors and icons.
 * Handles millions of merchants via a fallback "Profile/Avatar" strategy.
 */

export const PopularMerchants = {
    // Food & Dining
    'zomato': { color: '#E23744', icon: 'fast-food-outline' },
    'swiggy': { color: '#FC8019', icon: 'fast-food-outline' },
    'starbucks': { color: '#00704A', icon: 'cafe-outline' },
    'dominos': { color: '#006491', icon: 'pizza-outline' },
    'mcdonald': { color: '#FFBC0D', icon: 'fast-food-outline' },
    'kfc': { color: '#E4002B', icon: 'fast-food-outline' },
    'burger king': { color: '#F5EBDC', icon: 'fast-food-outline' },

    // Shopping
    'amazon': { color: '#FF9900', icon: 'cart-outline' },
    'flipkart': { color: '#2874F0', icon: 'cart-outline' },
    'myntra': { color: '#FF3F6C', icon: 'shirt-outline' },
    'ajio': { color: '#2C4152', icon: 'bag-outline' },
    'nykaa': { color: '#E80071', icon: 'brush-outline' },
    'meesho': { color: '#F43397', icon: 'cart-outline' },

    // Travel & Transport
    'uber': { color: '#7a7a7a', icon: 'car-outline' },
    'ola': { color: '#A5C339', icon: 'car-outline' },
    'rapido': { color: '#F9D847', icon: 'bicycle-outline' },
    'irctc': { color: '#002F6C', icon: 'train-outline' },
    'indigo': { color: '#001D5D', icon: 'airplane-outline' },
    'makemytrip': { color: '#2196F3', icon: 'airplane-outline' },

    // Quick Commerce & Groceries
    'blinkit': { color: '#F8CB46', icon: 'basket-outline' },
    'zepto': { color: '#52218D', icon: 'basket-outline' },
    'bigbasket': { color: '#689F38', icon: 'basket-outline' },
    'instamart': { color: '#FF5200', icon: 'basket-outline' },
    'dmart': { color: '#007A33', icon: 'basket-outline' },

    // Utilities & Bills
    'jio': { color: '#0F3DA1', icon: 'cellular-outline' },
    'airtel': { color: '#E40000', icon: 'cellular-outline' },
    'vi ': { color: '#E31837', icon: 'cellular-outline' },
    'bescom': { color: '#FFB800', icon: 'flash-outline' },
    'tata play': { color: '#E4002B', icon: 'tv-outline' },

    // Entertainment
    'netflix': { color: '#E50914', icon: 'film-outline' },
    'prime': { color: '#00A8E1', icon: 'play-outline' },
    'hotstar': { color: '#001944', icon: 'film-outline' },
    'spotify': { color: '#1DB954', icon: 'musical-notes-outline' },
    'bookmyshow': { color: '#EC1849', icon: 'ticket-outline' },

    // Healthcare
    'apollo': { color: '#008542', icon: 'medical-outline' },
    'pharmeasy': { color: '#00A3A1', icon: 'medical-outline' },
    '1mg': { color: '#FF6F61', icon: 'medical-outline' },

    // Investment/Savings
    'zerodha': { color: '#387ED1', icon: 'stats-chart-outline' },
    'groww': { color: '#00D09C', icon: 'trending-up-outline' },
    'cred': { color: '#000000', icon: 'card-outline' },
};

export class MerchantMapper {
    /**
     * Cleans merchant name from SMS noise (e.g., "SWIGGY*123" -> "Swiggy")
     */
    static cleanName(name) {
        if (!name) return 'Unknown';

        return name
            .split('@')[0]              // Remove UPI handle
            .split('*')[0]              // Remove transaction codes
            .replace(/[0-9]/g, '')      // Remove numbers
            .trim();
    }

    /**
     * Returns brand details or null if not a "Big Player"
     */
    static getMerchantDetails(name) {
        const cleaned = this.cleanName(name).toLowerCase();

        // Look for a partial match (e.g., "ZOMATO RESTAURANT" matches "zomato")
        const key = Object.keys(PopularMerchants).find(k => cleaned.includes(k));

        return PopularMerchants[key] || null;
    }
}

export default MerchantMapper;