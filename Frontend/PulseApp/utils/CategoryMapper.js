/**
 * Auto-categorize transactions based on merchant names and keywords
 */

export class CategoryMapper {
  static categories = {
    'Food & Dining': {
      keywords: [
        'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald',
        'kfc', 'subway', 'starbucks', 'cafe', 'coffee', 'restaurant',
        'food', 'biryani', 'dunkin', 'baskin', 'ice cream', 'bakery',
        'haldiram', 'barbeque', 'burger', 'chinese', 'dhaba',
      ],
    },

    'Shopping': {
      keywords: [
        'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
        'shoppers stop', 'lifestyle', 'reliance', 'dmart', 'big bazaar',
        'mall', 'store', 'fashion', 'clothing', 'shoes', 'electronics',
        'snapdeal', 'paytm mall', 'jiomart',
      ],
    },

    'Travel & Transport': {
      keywords: [
        'uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip',
        'goibibo', 'cleartrip', 'flight', 'train', 'bus', 'redbus',
        'ticket', 'airline', 'indigo', 'spicejet', 'petrol', 'fuel',
        'parking', 'toll', 'fastag',
      ],
    },

    'Bills & Utilities': {
      keywords: [
        'electricity', 'water', 'gas', 'lpg', 'phone', 'mobile',
        'broadband', 'internet', 'wifi', 'airtel', 'jio', 'vodafone',
        'bsnl', 'tata', 'bill payment', 'recharge', 'postpaid',
        'prepaid', 'dth', 'cable',
      ],
    },

    'Entertainment': {
      keywords: [
        'netflix', 'prime', 'hotstar', 'disney', 'spotify', 'youtube',
        'movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'game',
        'playstation', 'xbox', 'steam', 'subscription',
      ],
    },

    'Healthcare': {
      keywords: [
        'hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'apollo',
        'fortis', 'max', 'medanta', '1mg', 'pharmeasy', 'netmeds',
        'medicine', 'health', 'dental', 'diagnostic', 'lab test',
      ],
    },

    'Groceries': {
      keywords: [
        'grofer', 'blinkit', 'dunzo', 'bigbasket', 'jiomart',
        'grocery', 'supermarket', 'vegetables', 'fruits', 'milk',
      ],
    },

    'Education': {
      keywords: [
        'school', 'college', 'university', 'tuition', 'course',
        'udemy', 'coursera', 'upgrad', 'byjus', 'unacademy',
        'education', 'fees', 'books', 'stationery',
      ],
    },

    'Fitness': {
      keywords: [
        'gym', 'fitness', 'yoga', 'cult', 'healthify', 'sports',
        'swimming', 'membership',
      ],
    },

    'Income': {
      keywords: [
        'salary', 'received', 'credited', 'transfer from', 'refund',
        'cashback', 'reward', 'income', 'payment received',
      ],
    },
  };

  /**
   * Categorize transaction based on merchant name and SMS text
   */
  static categorize(merchant, smsText = '', type = 'debit') {
    // Handle income/credit transactions
    if (type === 'credit') {
      // Check if it's a refund
      if (smsText.toLowerCase().includes('refund')) {
        return 'Refund';
      }
      // Check if it's salary
      if (smsText.toLowerCase().includes('salary')) {
        return 'Income';
      }
      // Check if it's a transfer from someone
      if (smsText.toLowerCase().includes('transfer from')) {
        return 'Income';
      }
      // Default credit category
      return 'Income';
    }

    // For debit transactions, check merchant name
    const merchantLower = merchant.toLowerCase();
    const smsLower = smsText.toLowerCase();
    const combinedText = `${merchantLower} ${smsLower}`;

    // Check each category's keywords
    for (const [category, { keywords }] of Object.entries(this.categories)) {
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          return category;
        }
      }
    }

    // Default category
    return 'Others';
  }

  /**
   * Get all available categories
   */
  static getAllCategories() {
    return [
      ...Object.keys(this.categories),
      'Refund',
      'Others',
    ];
  }

  /**
   * Get category icon suggestion
   */
  static getCategoryIcon(category) {
    const icons = {
      'Food & Dining': 'restaurant',
      'Shopping': 'cart',
      'Travel & Transport': 'car',
      'Bills & Utilities': 'receipt',
      'Entertainment': 'film',
      'Healthcare': 'medical',
      'Groceries': 'basket',
      'Education': 'school',
      'Fitness': 'fitness',
      'Income': 'cash',
      'Refund': 'return-up-back',
      'Others': 'ellipsis-horizontal',
    };
    return icons[category] || 'ellipsis-horizontal';
  }

  /**
   * Get category color suggestion
   */
  static getCategoryColor(category) {
    const colors = {
      'Food & Dining': '#FF6B6B',
      'Shopping': '#4ECDC4',
      'Travel & Transport': '#95E1D3',
      'Bills & Utilities': '#F38181',
      'Entertainment': '#AA96DA',
      'Healthcare': '#FCBAD3',
      'Groceries': '#A8E6CF',
      'Education': '#FFD3B6',
      'Fitness': '#FFAAA5',
      'Income': '#8CF364',
      'Refund': '#8CF364',
      'Others': '#D1D5DB',
    };
    return colors[category] || '#D1D5DB';
  }
}

export default CategoryMapper;