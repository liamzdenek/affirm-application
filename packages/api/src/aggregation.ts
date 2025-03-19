import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { AggregatedData, Order } from '@affirm-merchant-analytics/shared';

// Initialize S3 client
const s3Client = new S3Client({});
const BUCKET_NAME = process.env.AGGREGATED_DATA_BUCKET || '';

// In-memory cache for aggregated data (in a real app, this would be persisted)
interface AggregatedDataCache {
  [key: string]: AggregatedData;
}

interface PaymentPlanMetrics {
  totalAmount: number;
  count: number;
}

interface PaymentPlanAOVCache {
  [planId: string]: PaymentPlanMetrics;
}

const aggregatedData: AggregatedDataCache = {};

/**
 * Lambda handler for processing DynamoDB Stream events
 */
export const handler = async (event: DynamoDBStreamEvent): Promise<{ statusCode: number; body: string }> => {
  console.log('Processing DynamoDB Stream event:', JSON.stringify(event, null, 2));
  console.log('Environment variables:', {
    BUCKET_NAME,
    NODE_ENV: process.env.NODE_ENV,
    AWS_REGION: process.env.AWS_REGION
  });

  try {
    console.log('Number of records to process:', event.Records.length);
    
    // Process each record in the batch
    for (const record of event.Records) {
      console.log('Processing record:', {
        eventID: record.eventID,
        eventName: record.eventName,
        eventSource: record.eventSource,
        awsRegion: record.awsRegion
      });
      
      // Only process INSERT and MODIFY events
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        console.log('Processing INSERT or MODIFY event');
        
        // Get the new image of the record
        if (!record.dynamodb || !record.dynamodb.NewImage) {
          console.warn('Record is missing dynamodb or NewImage property:', record);
          continue;
        }
        
        console.log('NewImage (raw):', JSON.stringify(record.dynamodb.NewImage, null, 2));
        const newImage = unmarshall(record.dynamodb.NewImage as Record<string, any>);
        console.log('NewImage (unmarshalled):', newImage);
        
        // Process the order
        await processOrder(newImage as Order);
      } else {
        console.log('Skipping event with name:', record.eventName);
      }
    }
    
    console.log('Successfully processed all records');
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('Error processing records:', error);
    return { statusCode: 500, body: 'Error processing records' };
  }
};

/**
 * Process an order and update aggregated data
 */
async function processOrder(order: Order): Promise<void> {
  console.log('Processing order:', order);
  
  const { merchantId, timestamp, amount, paymentPlan, status } = order;
  
  // Get the hour and day from the timestamp
  const date = new Date(timestamp);
  const hourKey = date.toISOString().slice(0, 13) + ':00:00Z'; // Format: 2025-03-19T10:00:00Z
  const dayKey = date.toISOString().slice(0, 10) + 'T00:00:00Z'; // Format: 2025-03-19T00:00:00Z
  
  console.log('Time keys:', { hourKey, dayKey });
  
  // Update hourly aggregated data
  console.log('Updating hourly aggregated data');
  await updateAggregatedData(merchantId, 'hourly', hourKey, amount, paymentPlan, status);
  
  // Update daily aggregated data
  console.log('Updating daily aggregated data');
  await updateAggregatedData(merchantId, 'daily', dayKey, amount, paymentPlan, status);
  
  console.log('Order processing completed');
}

/**
 * Update aggregated data for a specific merchant, granularity, and time period
 */
async function updateAggregatedData(
  merchantId: string,
  granularity: 'hourly' | 'daily',
  timeKey: string,
  amount: number,
  paymentPlan: string,
  status: 'success' | 'failure'
): Promise<void> {
  console.log('Updating aggregated data:', { merchantId, granularity, timeKey, amount, paymentPlan, status });
  
  // Create a unique key for the aggregated data
  const dataKey = `${merchantId}/${granularity}/${timeKey}`;
  console.log('Data key:', dataKey);
  
  // Initialize aggregated data if it doesn't exist
  if (!aggregatedData[dataKey]) {
    console.log('Initializing new aggregated data for key:', dataKey);
    aggregatedData[dataKey] = {
      merchantId,
      granularity,
      timestamp: timeKey,
      metrics: {
        volume: {
          total: 0,
          successful: 0,
          failed: 0,
        },
        aov: {
          overall: 0,
          byPaymentPlan: {},
        },
      },
    };
  } else {
    console.log('Using existing aggregated data for key:', dataKey);
  }
  
  // Get the current aggregated data
  const data = aggregatedData[dataKey];
  console.log('Current aggregated data before update:', JSON.stringify(data, null, 2));
  
  // Update volume metrics
  data.metrics.volume.total += 1;
  if (status === 'success') {
    data.metrics.volume.successful += 1;
    console.log('Incremented successful orders count');
  } else {
    data.metrics.volume.failed += 1;
    console.log('Incremented failed orders count');
  }
  
  // Update AOV metrics (only for successful orders)
  if (status === 'success') {
    console.log('Updating AOV metrics for successful order');
    
    // Create a temporary cache for payment plan metrics
    const paymentPlanCache: PaymentPlanAOVCache = {};
    
    // Initialize payment plan cache
    for (const plan in data.metrics.aov.byPaymentPlan) {
      paymentPlanCache[plan] = {
        totalAmount: data.metrics.aov.byPaymentPlan[plan] * (data.metrics.volume.successful - 1), // Reverse calculate the total
        count: data.metrics.volume.successful - 1,
      };
      console.log(`Initialized payment plan cache for ${plan}:`, paymentPlanCache[plan]);
    }
    
    // Initialize current payment plan if it doesn't exist
    if (!paymentPlanCache[paymentPlan]) {
      console.log(`Initializing new payment plan cache for ${paymentPlan}`);
      paymentPlanCache[paymentPlan] = {
        totalAmount: 0,
        count: 0,
      };
    }
    
    // Update payment plan metrics
    paymentPlanCache[paymentPlan].totalAmount += amount;
    paymentPlanCache[paymentPlan].count += 1;
    console.log(`Updated payment plan metrics for ${paymentPlan}:`, paymentPlanCache[paymentPlan]);
    
    // Calculate AOV for each payment plan
    for (const plan in paymentPlanCache) {
      const planData = paymentPlanCache[plan];
      data.metrics.aov.byPaymentPlan[plan] = planData.count > 0 ? planData.totalAmount / planData.count : 0;
      console.log(`Calculated AOV for ${plan}:`, data.metrics.aov.byPaymentPlan[plan]);
    }
    
    // Calculate overall AOV
    let totalAmount = 0;
    let totalCount = 0;
    
    for (const plan in paymentPlanCache) {
      totalAmount += paymentPlanCache[plan].totalAmount;
      totalCount += paymentPlanCache[plan].count;
    }
    
    data.metrics.aov.overall = totalCount > 0 ? totalAmount / totalCount : 0;
    console.log('Calculated overall AOV:', data.metrics.aov.overall);
  }
  
  console.log('Updated aggregated data:', JSON.stringify(data, null, 2));
  
  // Store the updated aggregated data in S3
  await storeAggregatedData(dataKey, data);
}

/**
 * Store aggregated data in S3
 */
async function storeAggregatedData(dataKey: string, data: AggregatedData): Promise<void> {
  try {
    // Create the S3 key
    const s3Key = `metrics/${dataKey}.json`;
    console.log('Storing aggregated data in S3 with key:', s3Key);
    console.log('Bucket name:', BUCKET_NAME);
    
    const body = JSON.stringify(data);
    console.log('Data to store (first 100 chars):', body.substring(0, 100) + '...');
    
    // Store the data in S3
    console.log('Sending PutObjectCommand to S3');
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: body,
      ContentType: 'application/json',
    }));
    
    console.log(`Successfully stored aggregated data in S3: ${s3Key}`);
  } catch (error) {
    console.error('Error storing aggregated data in S3:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}