import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import serverless from 'serverless-http';
import {
  OrderRequest,
  OrderResponse,
  RecentOrdersQuery,
  RecentOrdersResponse,
  AnalyticsQuery,
  AnalyticsResponse,
  AggregatedData,
  Order,
  SAMPLE_MERCHANTS,
  SAMPLE_PRODUCTS,
  SAMPLE_PAYMENT_PLANS
} from '@affirm-merchant-analytics/shared';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for orders (in a real app, this would be DynamoDB)
const orders: Order[] = [];

// In-memory storage for aggregated data (in a real app, this would be S3)
const aggregatedData: AggregatedData[] = [];

// Generate sample analytics data
const generateSampleData = () => {
  const merchants = SAMPLE_MERCHANTS.map(m => m.id);
  const paymentPlans = SAMPLE_PAYMENT_PLANS.map(p => p.id);
  
  // Generate data for the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Generate hourly data
  for (let d = new Date(sevenDaysAgo); d <= now; d.setHours(d.getHours() + 1)) {
    for (const merchantId of merchants) {
      // Generate random metrics
      const totalOrders = Math.floor(Math.random() * 100);
      const failedOrders = Math.floor(Math.random() * 10);
      const successfulOrders = totalOrders - failedOrders;
      
      // Generate random AOV by payment plan
      const aovByPaymentPlan: Record<string, number> = {};
      let totalAmount = 0;
      
      for (const plan of paymentPlans) {
        const planOrders = Math.floor(Math.random() * successfulOrders);
        const planAmount = planOrders * (Math.random() * 1000 + 100);
        aovByPaymentPlan[plan] = planOrders > 0 ? planAmount / planOrders : 0;
        totalAmount += planAmount;
      }
      
      // Calculate overall AOV
      const overallAOV = successfulOrders > 0 ? totalAmount / successfulOrders : 0;
      
      // Create hourly aggregated data
      const hourlyData: AggregatedData = {
        merchantId,
        granularity: 'hourly',
        timestamp: d.toISOString(),
        metrics: {
          volume: {
            total: totalOrders,
            successful: successfulOrders,
            failed: failedOrders
          },
          aov: {
            overall: overallAOV,
            byPaymentPlan: aovByPaymentPlan
          }
        }
      };
      
      aggregatedData.push(hourlyData);
    }
  }
  
  // Generate daily data
  for (let d = new Date(sevenDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    for (const merchantId of merchants) {
      // Generate random metrics
      const totalOrders = Math.floor(Math.random() * 1000);
      const failedOrders = Math.floor(Math.random() * 100);
      const successfulOrders = totalOrders - failedOrders;
      
      // Generate random AOV by payment plan
      const aovByPaymentPlan: Record<string, number> = {};
      let totalAmount = 0;
      
      for (const plan of paymentPlans) {
        const planOrders = Math.floor(Math.random() * successfulOrders);
        const planAmount = planOrders * (Math.random() * 1000 + 100);
        aovByPaymentPlan[plan] = planOrders > 0 ? planAmount / planOrders : 0;
        totalAmount += planAmount;
      }
      
      // Calculate overall AOV
      const overallAOV = successfulOrders > 0 ? totalAmount / successfulOrders : 0;
      
      // Create daily aggregated data
      const dailyData: AggregatedData = {
        merchantId,
        granularity: 'daily',
        timestamp: d.toISOString(),
        metrics: {
          volume: {
            total: totalOrders,
            successful: successfulOrders,
            failed: failedOrders
          },
          aov: {
            overall: overallAOV,
            byPaymentPlan: aovByPaymentPlan
          }
        }
      };
      
      aggregatedData.push(dailyData);
    }
  }
};

// Generate sample data
generateSampleData();

// Routes

// Get merchants
app.get('/merchants', (_req, res) => {
  res.json(SAMPLE_MERCHANTS);
});

// Get products for a merchant
app.get('/merchants/:merchantId/products', (req, res) => {
  const { merchantId } = req.params;
  const products = SAMPLE_PRODUCTS.filter(p => p.merchantId === merchantId);
  res.json(products);
});

// Get payment plans
app.get('/payment-plans', (_req, res) => {
  res.json(SAMPLE_PAYMENT_PLANS);
});

// Submit a new order
app.post('/orders', (req, res) => {
  try {
    const orderRequest = req.body as OrderRequest;
    
    // Validate request
    if (!orderRequest.merchantId || !orderRequest.productId || !orderRequest.amount || !orderRequest.paymentPlan) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Generate order ID
    const orderId = uuidv4();
    
    // Determine order status based on simulateFailure flag
    const status = orderRequest.simulateFailure ? 'failure' : 'success';
    
    // Create order
    const timestamp = new Date().toISOString();
    const order: Order = {
      merchantId: orderRequest.merchantId,
      orderId,
      timestamp,
      amount: orderRequest.amount,
      paymentPlan: orderRequest.paymentPlan,
      status,
      productId: orderRequest.productId
    };
    
    // Store order
    orders.push(order);
    
    // In a real app, this would trigger a DynamoDB Stream event
    // which would be processed by a Lambda function
    
    // Return response
    const response: OrderResponse = {
      orderId,
      merchantId: orderRequest.merchantId,
      timestamp,
      status
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent orders for a merchant
app.get('/merchants/:merchantId/orders', (req, res) => {
  try {
    const { merchantId } = req.params;
    const query = req.query as unknown as RecentOrdersQuery;
    const limit = query.limit || 10;
    const status = query.status;
    
    // Filter orders by merchant ID and status (if provided)
    let filteredOrders = orders.filter(order => order.merchantId === merchantId);
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    // Sort by timestamp (newest first) and limit
    const sortedOrders = filteredOrders
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, Number(limit));
    
    // Return response
    const response: RecentOrdersResponse = {
      orders: sortedOrders
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics for a merchant
app.get('/merchants/:merchantId/analytics', (req, res) => {
  try {
    const { merchantId } = req.params;
    const query = req.query as unknown as AnalyticsQuery;
    const granularity = query.granularity || 'hourly';
    const { startDate, endDate } = query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing required query parameters: startDate and endDate' });
      return;
    }
    
    // Filter aggregated data by merchant ID, granularity, and date range
    const filteredData = aggregatedData.filter(data => 
      data.merchantId === merchantId &&
      data.granularity === granularity &&
      data.timestamp >= startDate &&
      data.timestamp <= endDate
    );
    
    // Sort by timestamp
    const sortedData = filteredData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Transform to response format
    const timePoints = sortedData.map(data => ({
      timestamp: data.timestamp,
      metrics: data.metrics
    }));
    
    // Return response
    const response: AnalyticsResponse = {
      merchantId,
      timePoints
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Export the Express app
export const expressApp = app;

// Export the serverless handler
export const handler = serverless(app);