import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import serverless from 'serverless-http';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize S3 client
const s3Client = new S3Client({});

// Get resource names from environment variables or use defaults
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'OrdersTable';
const AGGREGATED_DATA_BUCKET = process.env.AGGREGATED_DATA_BUCKET || 'AggregatedDataBucket';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// No in-memory storage - using DynamoDB and S3 for persistence

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
app.post('/orders', async (req, res) => {
  try {
    console.log('Order request received:', req.body);
    
    const orderRequest = req.body as OrderRequest;
    
    // Validate request
    if (!orderRequest.merchantId || !orderRequest.productId || !orderRequest.amount || !orderRequest.paymentPlan) {
      console.log('Missing required fields in order request');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Generate order ID
    const orderId = uuidv4();
    console.log('Generated order ID:', orderId);
    
    // Determine order status based on simulateFailure flag
    const status = orderRequest.simulateFailure ? 'failure' : 'success';
    console.log('Order status:', status);
    
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
    
    console.log('Storing order in DynamoDB:', {
      TableName: ORDERS_TABLE,
      Item: order
    });
    
    // Store order in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: ORDERS_TABLE,
        Item: order
      })
    );
    
    console.log('Order stored successfully in DynamoDB');
    console.log('This will trigger a DynamoDB Stream event which will be processed by the aggregation Lambda function');
    
    // Return response
    const response: OrderResponse = {
      orderId,
      merchantId: orderRequest.merchantId,
      timestamp,
      status
    };
    
    console.log('Sending response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent orders for a merchant
app.get('/merchants/:merchantId/orders', async (req, res) => {
  try {
    console.log('Recent orders request received:', {
      params: req.params,
      query: req.query
    });
    
    const { merchantId } = req.params;
    const query = req.query as unknown as RecentOrdersQuery;
    const limit = query.limit || 10;
    const status = query.status;
    
    console.log('Recent orders parameters:', { merchantId, limit, status });
    
    // Query DynamoDB for orders by merchant ID
    const queryParams: any = {
      TableName: ORDERS_TABLE,
      KeyConditionExpression: 'merchantId = :merchantId',
      ExpressionAttributeValues: {
        ':merchantId': merchantId
      },
      Limit: Number(limit),
      ScanIndexForward: false // Sort by sort key (orderId) in descending order
    };
    
    // Add filter for status if provided
    if (status) {
      queryParams.FilterExpression = 'status = :status';
      queryParams.ExpressionAttributeValues = {
        ...queryParams.ExpressionAttributeValues,
        ':status': status
      };
    }
    
    console.log('DynamoDB query parameters:', queryParams);
    
    const result = await docClient.send(new QueryCommand(queryParams));
    
    console.log('DynamoDB query result:', {
      Count: result.Count,
      ScannedCount: result.ScannedCount,
      Items: result.Items ? result.Items.length : 0
    });
    
    if (result.Items && result.Items.length > 0) {
      console.log('First item sample:', result.Items[0]);
    }
    
    // Return response
    const response: RecentOrdersResponse = {
      orders: result.Items as Order[]
    };
    
    console.log('Sending response with orders:', response.orders.length);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics for a merchant
app.get('/merchants/:merchantId/analytics', async (req, res) => {
  try {
    console.log('Analytics request received:', {
      params: req.params,
      query: req.query,
      headers: req.headers,
      url: req.url
    });
    
    const { merchantId } = req.params;
    const query = req.query as unknown as AnalyticsQuery;
    const granularity = query.granularity || 'hourly';
    const { startDate, endDate } = query;
    
    console.log('Analytics request parameters:', { merchantId, granularity, startDate, endDate });
    
    if (!startDate || !endDate) {
      console.log('Missing required query parameters');
      res.status(400).json({ error: 'Missing required query parameters: startDate and endDate' });
      return;
    }
    
    // List objects in the S3 bucket with the prefix for this merchant and granularity
    const prefix = `metrics/${merchantId}/${granularity}/`;
    console.log('S3 prefix:', prefix);
    console.log('S3 bucket:', AGGREGATED_DATA_BUCKET);
    
    try {
      console.log('Sending ListObjectsV2Command to S3');
      const listResult = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: AGGREGATED_DATA_BUCKET,
          Prefix: prefix
        })
      );
      
      console.log('ListObjectsV2Command result:', JSON.stringify(listResult, null, 2));
      
      if (!listResult.Contents || listResult.Contents.length === 0) {
        // If no data is found, return empty response
        console.log('No objects found in S3 with prefix:', prefix);
        res.status(200).json({
          merchantId,
          timePoints: []
        });
        return;
      }
      
      console.log('Found objects in S3:', listResult.Contents.length);
      console.log('Object keys:', listResult.Contents.map(obj => obj.Key));
      
      // Filter objects by date range
      const filteredKeys = listResult.Contents
        .filter(obj => {
          const key = obj.Key || '';
          const timestamp = key.split('/').pop()?.replace('.json', '') || '';
          
          // Parse the dates for proper comparison
          const timestampDate = timestamp.split('T')[0]; // Extract just the date part
          console.log('Comparing dates:', {
            timestamp,
            timestampDate,
            startDate,
            endDate,
            isAfterStart: timestampDate >= startDate,
            isBeforeEnd: timestampDate <= endDate
          });
          
          const isInRange = timestampDate >= startDate && timestampDate <= endDate;
          console.log('Filtering key:', { key, timestamp, timestampDate, startDate, endDate, isInRange });
          return isInRange;
        })
        .map(obj => obj.Key || '');
      
      console.log('Filtered keys:', filteredKeys);
      
      // Get the content of each filtered object
      const dataPromises = filteredKeys.map(async (key) => {
        try {
          console.log('Getting object from S3:', key);
          const getResult = await s3Client.send(
            new GetObjectCommand({
              Bucket: AGGREGATED_DATA_BUCKET,
              Key: key
            })
          );
          
          // Convert stream to string
          const bodyContents = await getResult.Body?.transformToString();
          if (!bodyContents) {
            console.log('No body contents for key:', key);
            return null;
          }
          
          console.log('Object body for key:', key, bodyContents.substring(0, 100) + '...');
          return JSON.parse(bodyContents) as AggregatedData;
        } catch (error) {
          console.error(`Error getting object ${key}:`, error);
          return null;
        }
      });
      
      // Wait for all promises to resolve
      const dataArray = (await Promise.all(dataPromises)).filter(Boolean) as AggregatedData[];
      console.log('Data array length:', dataArray.length);
      
      // Sort by timestamp
      const sortedData = dataArray.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      console.log('Sorted data length:', sortedData.length);
      
      // Transform to response format
      const timePoints = sortedData.map(data => ({
        timestamp: data.timestamp,
        metrics: data.metrics
      }));
      console.log('Time points length:', timePoints.length);
      
      // Return response
      const response: AnalyticsResponse = {
        merchantId,
        timePoints
      };
      
      console.log('Sending response with time points:', timePoints.length);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error listing objects in S3:', error);
      res.status(500).json({ error: 'Error retrieving analytics data from S3', details: String(error) });
    }
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