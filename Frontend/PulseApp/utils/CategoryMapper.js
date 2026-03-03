/**
 * Auto-categorize transactions based on merchant names and keywords
 * Used by SMS parser to auto-categorize transactions
 */

export class CategoryMapper {
  // All categories for SMS parsing
  static categories = {
    'Food & Dining': {
      keywords: [
        'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald',
        'kfc', 'subway', 'starbucks', 'cafe', 'coffee', 'restaurant',
        'food', 'biryani', 'dunkin', 'baskin', 'ice cream', 'bakery',
        'haldiram', 'barbeque', 'burger', 'chinese', 'dhaba',
      ],
      icon: 'restaurant-outline',
      color: '#FFB800',
    },

    'Shopping': {
      keywords: [
        'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
        'shoppers stop', 'lifestyle', 'reliance', 'dmart', 'big bazaar',
        'mall', 'store', 'fashion', 'clothing', 'shoes', 'electronics',
        'snapdeal', 'paytm mall',
      ],
      icon: 'cart-outline',
      color: '#F472B6',
    },

    'Travel & Transport': {
      keywords: [
        'uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip',
        'goibibo', 'cleartrip', 'flight', 'train', 'bus', 'redbus',
        'ticket', 'airline', 'indigo', 'spicejet', 'petrol', 'fuel',
        'parking', 'toll', 'fastag',
      ],
      icon: 'car-outline',
      color: '#3B82F6',
    },

    'Bills & Utilities': {
      keywords: [
        'electricity', 'water', 'gas', 'lpg', 'phone', 'mobile',
        'broadband', 'internet', 'wifi', 'airtel', 'jio', 'vodafone',
        'bsnl', 'tata', 'bill payment', 'recharge', 'postpaid',
        'prepaid', 'dth', 'cable',
      ],
      icon: 'receipt-outline',
      color: '#10B981',
    },

    'Entertainment': {
      keywords: [
        'netflix', 'prime', 'hotstar', 'disney', 'spotify', 'youtube',
        'movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'game',
        'playstation', 'xbox', 'steam', 'subscription',
      ],
      icon: 'film-outline',
      color: '#A855F7',
    },

    'Healthcare': {
      keywords: [
        'hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'apollo',
        'fortis', 'max', 'medanta', '1mg', 'pharmeasy', 'netmeds',
        'medicine', 'health', 'dental', 'diagnostic', 'lab test',
      ],
      icon: 'medical-outline',
      color: '#EF4444',
    },

    'Groceries': {
      keywords: [
        'grofer', 'blinkit', 'dunzo', 'bigbasket', 'jiomart',
        'grocery', 'supermarket', 'vegetables', 'fruits', 'milk',
      ],
      icon: 'basket-outline',
      color: '#A8E6CF',
    },

    'Education': {
      keywords: [
        'school', 'college', 'university', 'tuition', 'course',
        'udemy', 'coursera', 'upgrad', 'byjus', 'unacademy',
        'education', 'fees', 'books', 'stationery',
      ],
      icon: 'school-outline',
      color: '#FFD3B6',
    },

    'Fitness': {
      keywords: [
        'gym', 'fitness', 'yoga', 'cult', 'healthify', 'sports',
        'swimming', 'membership',
      ],
      icon: 'fitness-outline',
      color: '#FFAAA5',
    },

    'Savings': {
      keywords: [
        'sip', 'mutual fund', 'investment', 'stock', 'zerodha',
        'groww', 'upstox', 'fd', 'recurring deposit',
        'autopay', 'mandate', 'iccl', 'mf', 'equity',
        'mutual funds', 'systematic', 'elss', 'nfo',
      ],
      icon: 'wallet-outline',
      color: '#8CF364',
    },
  };

  // Core categories - shown by default in budget
  static coreCategories = [
    'Food & Dining',
    'Shopping',
    'Travel & Transport',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
  ];

  // Optional categories - user can add to budget
  static optionalCategories = [
    'Groceries',
    'Education',
    'Fitness',
    'Savings',
  ];

  /**
   * Categorize transaction based on merchant name and SMS text
   * Used by SMS parser
   */
  static categorize(merchant, smsText = '', type = 'debit') {
    const lower = smsText.toLowerCase();
    const merchantLower = (merchant || '').toLowerCase();

    // Handle income/credit transactions
    if (type === 'credit') {
      if (lower.includes('refund')) {
        return 'Refund';
      }

      if (lower.includes('salary')) {
        return 'Salary';
      }

      if (lower.includes('upi') || lower.includes('imps') || lower.includes('neft')) {
        if (merchantLower.includes('@') ||
          /^\d+$/.test(merchantLower) ||
          lower.includes('linked to mobile')) {
          return 'Transfer';
        }
      }

      if (lower.includes('transfer from')) {
        return 'Transfer';
      }

      return 'Income';
    }

    const combinedText = `${merchantLower} ${lower}`;

    for (const [category, { keywords }] of Object.entries(this.categories)) {
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Others';
  }

  /**
   * Get all available categories (for SMS parsing)
   */
  static getAllCategories() {
    return [
      ...Object.keys(this.categories),
      'Income',
      'Salary',
      'Transfer',
      'Refund',
      'Others',
    ];
  }

  /**
   * Get core categories (shown by default in budget)
   */
  static getCoreCategories() {
    return this.coreCategories;
  }

  /**
   * Get optional categories (user can add to budget)
   */
  static getOptionalCategories() {
    return this.optionalCategories;
  }

  /**
   * Get category details (icon, color, keywords)
   */
  static getCategoryDetails(categoryName) {
    // Handle special income categories
    const specialCategories = {
      'Income': { icon: 'cash-outline', color: '#8CF364', keywords: [] },
      'Salary': { icon: 'briefcase-outline', color: '#8CF364', keywords: [] },
      'Transfer': { icon: 'swap-horizontal-outline', color: '#3B82F6', keywords: [] },
      'Refund': { icon: 'return-up-back-outline', color: '#8CF364', keywords: [] },
      'Others': { icon: 'ellipsis-horizontal', color: '#D1D5DB', keywords: [] },
    };

    return this.categories[categoryName] || specialCategories[categoryName] || {
      icon: 'ellipsis-horizontal',
      color: '#D1D5DB',
      keywords: [],
    };
  }

  /**
   * Get category icon suggestion
   */
  static getCategoryIcon(category) {
    const details = this.getCategoryDetails(category);
    return details.icon || 'ellipsis-horizontal';
  }

  /**
   * Get category color suggestion
   */
  static getCategoryColor(category) {
    const details = this.getCategoryDetails(category);
    return details.color || '#D1D5DB';
  }
}

export default CategoryMapper;