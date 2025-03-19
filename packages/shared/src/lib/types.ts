/**
 * Shared types for the Merchant Analytics Dashboard
 */

/**
 * Order Request - Used when submitting a new order
 */
export interface OrderRequest {
  merchantId: string;
  productId: string;
  amount: number;
  paymentPlan: string;
  simulateFailure: boolean;
}

/**
 * Order Response - Returned after submitting an order
 */
export interface OrderResponse {
  orderId: string;
  merchantId: string;
  timestamp: string;
  status: 'success' | 'failure';
}

/**
 * Analytics Query Parameters - Used when requesting analytics data
 */
export interface AnalyticsQuery {
  granularity: 'hourly' | 'daily';
  startDate: string; // ISO format
  endDate: string; // ISO format
}

/**
 * Analytics Response - Returned when requesting analytics data
 */
export interface AnalyticsResponse {
  merchantId: string;
  timePoints: Array<{
    timestamp: string;
    metrics: {
      volume: {
        total: number;
        successful: number;
        failed: number;
      };
      aov: {
        overall: number;
        byPaymentPlan: {
          [planName: string]: number;
        };
      };
      counts: {
        byPaymentPlan: {
          [planId: string]: number;
        };
        byProduct: {
          [productId: string]: number;
        };
      };
    };
  }>;
}

/**
 * Recent Orders Query Parameters - Used when requesting recent orders
 */
export interface RecentOrdersQuery {
  limit?: number; // Default: 10
  status?: 'success' | 'failure'; // Optional filter
}

/**
 * Recent Orders Response - Returned when requesting recent orders
 */
export interface RecentOrdersResponse {
  orders: Array<{
    orderId: string;
    timestamp: string;
    amount: number;
    paymentPlan: string;
    status: 'success' | 'failure';
    productId: string;
  }>;
}

/**
 * Order - Database model for an order
 */
export interface Order {
  merchantId: string;
  orderId: string;
  timestamp: string;
  amount: number;
  paymentPlan: string;
  status: 'success' | 'failure';
  productId: string;
}

/**
 * Aggregated Data - Format for storing aggregated metrics in S3
 */
export interface AggregatedData {
  merchantId: string;
  granularity: 'hourly' | 'daily';
  timestamp: string; // Start of the time period
  metrics: {
    volume: {
      total: number;
      successful: number;
      failed: number;
    };
    aov: {
      overall: number;
      byPaymentPlan: {
        [planName: string]: number;
      };
    };
    counts: {
      byPaymentPlan: {
        [planId: string]: number;
      };
      byProduct: {
        [productId: string]: number;
      };
    };
  };
}

/**
 * Merchant - Represents a merchant in the system
 */
export interface Merchant {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

/**
 * Product - Represents a product that can be purchased
 */
export interface Product {
  id: string;
  merchantId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

/**
 * Payment Plan - Represents an Affirm payment plan
 */
export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  termMonths: number;
  interestRate: number;
}

/**
 * Sample data for the application
 */
export const SAMPLE_MERCHANTS: Merchant[] = [
  {
    id: 'merchant-1',
    name: 'Fashion Boutique',
    description: 'High-end fashion retailer'
  },
  {
    id: 'merchant-2',
    name: 'Electronics Emporium',
    description: 'Latest gadgets and electronics'
  },
  {
    id: 'merchant-3',
    name: 'Home Goods Store',
    description: 'Quality furniture and home decor'
  }
];

/**
 * Sample products for each merchant
 */
export const SAMPLE_PRODUCTS: Product[] = [
  // Fashion Boutique Products
  {
    id: 'product-1-1',
    merchantId: 'merchant-1',
    name: 'Designer Handbag',
    price: 1200,
    description: 'Luxury designer handbag'
  },
  {
    id: 'product-1-2',
    merchantId: 'merchant-1',
    name: 'Premium Jeans',
    price: 200,
    description: 'High-quality denim jeans'
  },
  {
    id: 'product-1-3',
    merchantId: 'merchant-1',
    name: 'Cashmere Sweater',
    price: 300,
    description: 'Soft cashmere sweater'
  },
  
  // Electronics Emporium Products
  {
    id: 'product-2-1',
    merchantId: 'merchant-2',
    name: 'Smartphone',
    price: 1000,
    description: 'Latest smartphone model'
  },
  {
    id: 'product-2-2',
    merchantId: 'merchant-2',
    name: 'Laptop',
    price: 1500,
    description: 'High-performance laptop'
  },
  {
    id: 'product-2-3',
    merchantId: 'merchant-2',
    name: 'Wireless Headphones',
    price: 250,
    description: 'Noise-cancelling wireless headphones'
  },
  
  // Home Goods Store Products
  {
    id: 'product-3-1',
    merchantId: 'merchant-3',
    name: 'Sectional Sofa',
    price: 2000,
    description: 'Comfortable sectional sofa'
  },
  {
    id: 'product-3-2',
    merchantId: 'merchant-3',
    name: 'Dining Table',
    price: 800,
    description: 'Solid wood dining table'
  },
  {
    id: 'product-3-3',
    merchantId: 'merchant-3',
    name: 'Bed Frame',
    price: 600,
    description: 'Queen-size bed frame'
  }
];

/**
 * Sample payment plans
 */
export const SAMPLE_PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'plan-1',
    name: 'Pay in 4',
    description: '4 interest-free payments every 2 weeks',
    termMonths: 2,
    interestRate: 0
  },
  {
    id: 'plan-2',
    name: '3 Month Financing',
    description: 'Pay over 3 months',
    termMonths: 3,
    interestRate: 0
  },
  {
    id: 'plan-3',
    name: '6 Month Financing',
    description: 'Pay over 6 months',
    termMonths: 6,
    interestRate: 0
  },
  {
    id: 'plan-4',
    name: '12 Month Financing',
    description: 'Pay over 12 months',
    termMonths: 12,
    interestRate: 0.1
  }
];