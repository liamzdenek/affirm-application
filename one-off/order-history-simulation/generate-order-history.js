#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Sample data from the application
const MERCHANTS = [
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

const PRODUCTS = [
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

const PAYMENT_PLANS = [
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

// Configuration
const ONE_MONTH_AGO = new Date();
ONE_MONTH_AGO.setMonth(ONE_MONTH_AGO.getMonth() - 1);

const NOW = new Date();
const TEMP_DIR = path.join(__dirname, 'temp-s3-data');
const S3_BUCKET_NAME = 'merchantanalytics-s3-aggregateddatabucket2398e4ee-tzvgwhv4lxvv'; // Replace with your actual bucket name

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomProduct(merchantId) {
  const merchantProducts = PRODUCTS.filter(p => p.merchantId === merchantId);
  return getRandomElement(merchantProducts);
}

function getRandomPaymentPlan() {
  return getRandomElement(PAYMENT_PLANS);
}

function generateOrderId() {
  return `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getDayOfWeekFactor(date) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend boost (Saturday and Sunday)
  if (day === 0 || day === 6) {
    return 1.5; // 50% more orders on weekends
  }
  
  // Friday boost
  if (day === 5) {
    return 1.2; // 20% more orders on Friday
  }
  
  // Monday dip
  if (day === 1) {
    return 0.8; // 20% fewer orders on Monday
  }
  
  // Regular weekday
  return 1.0;
}

function getTimeOfDayFactor(hour) {
  // Peak hours: 10am-2pm and 7pm-10pm
  if ((hour >= 10 && hour <= 14) || (hour >= 19 && hour <= 22)) {
    return 1.5; // 50% more orders during peak hours
  }
  
  // Business hours: 8am-6pm (excluding peak)
  if (hour >= 8 && hour <= 18) {
    return 1.0; // Normal volume during business hours
  }
  
  // Evening: 6pm-7pm and 10pm-midnight
  if ((hour >= 18 && hour < 19) || (hour >= 22 && hour < 24)) {
    return 0.8; // 20% fewer orders in the evening
  }
  
  // Night: midnight-8am
  return 0.3; // 70% fewer orders overnight
}

function generateOrder(timestamp) {
  const merchantId = getRandomElement(MERCHANTS).id;
  const product = getRandomProduct(merchantId);
  const paymentPlan = getRandomPaymentPlan();
  const simulateFailure = Math.random() < 0.05; // 5% failure rate
  
  return {
    merchantId,
    orderId: generateOrderId(),
    timestamp: timestamp.toISOString(),
    amount: product.price,
    paymentPlan: paymentPlan.id,
    status: simulateFailure ? 'failure' : 'success',
    productId: product.id
  };
}

function generateHourlyOrders(startDate, endDate) {
  const orders = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const hour = currentDate.getHours();
    const dayFactor = getDayOfWeekFactor(currentDate);
    const timeFactor = getTimeOfDayFactor(hour);
    
    // Base number of orders per hour (adjust as needed)
    const baseOrderCount = 5;
    
    // Calculate actual order count with some randomness
    const orderCount = Math.max(1, Math.round(baseOrderCount * dayFactor * timeFactor * (0.8 + Math.random() * 0.4)));
    
    // Generate orders for this hour
    for (let i = 0; i < orderCount; i++) {
      // Distribute orders randomly within the hour
      const orderTime = new Date(currentDate);
      orderTime.setMinutes(getRandomInt(0, 59));
      orderTime.setSeconds(getRandomInt(0, 59));
      
      orders.push(generateOrder(orderTime));
    }
    
    // Move to next hour
    currentDate.setHours(currentDate.getHours() + 1);
  }
  
  return orders;
}

function aggregateOrdersHourly(orders) {
  const hourlyAggregates = {};
  
  // Group orders by merchant and hour
  orders.forEach(order => {
    const date = new Date(order.timestamp);
    const hourKey = date.toISOString().slice(0, 13) + ':00:00Z'; // Format: 2025-03-19T10:00:00Z
    const merchantId = order.merchantId;
    const key = `${merchantId}/hourly/${hourKey}`;
    
    if (!hourlyAggregates[key]) {
      hourlyAggregates[key] = {
        merchantId,
        granularity: 'hourly',
        timestamp: hourKey,
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
          counts: {
            byPaymentPlan: {},
            byProduct: {},
          },
        },
      };
    }
    
    const aggregate = hourlyAggregates[key];
    
    // Update volume metrics
    aggregate.metrics.volume.total += 1;
    if (order.status === 'success') {
      aggregate.metrics.volume.successful += 1;
    } else {
      aggregate.metrics.volume.failed += 1;
    }
    
    // Update payment plan counts
    const paymentPlan = order.paymentPlan;
    if (!aggregate.metrics.counts.byPaymentPlan[paymentPlan]) {
      aggregate.metrics.counts.byPaymentPlan[paymentPlan] = 0;
    }
    aggregate.metrics.counts.byPaymentPlan[paymentPlan] += 1;
    
    // Update product counts
    const productId = order.productId;
    if (!aggregate.metrics.counts.byProduct[productId]) {
      aggregate.metrics.counts.byProduct[productId] = 0;
    }
    aggregate.metrics.counts.byProduct[productId] += 1;
    
    // Update AOV metrics (only for successful orders)
    if (order.status === 'success') {
      // Initialize payment plan if it doesn't exist
      if (!aggregate.metrics.aov.byPaymentPlan[paymentPlan]) {
        aggregate.metrics.aov.byPaymentPlan[paymentPlan] = 0;
      }
      
      // Calculate running average for this payment plan
      const currentTotal = aggregate.metrics.aov.byPaymentPlan[paymentPlan] * (aggregate.metrics.volume.successful - 1);
      const newTotal = currentTotal + order.amount;
      aggregate.metrics.aov.byPaymentPlan[paymentPlan] = newTotal / aggregate.metrics.volume.successful;
      
      // Calculate overall AOV
      let totalAmount = 0;
      let totalCount = 0;
      
      for (const plan in aggregate.metrics.aov.byPaymentPlan) {
        const planAOV = aggregate.metrics.aov.byPaymentPlan[plan];
        const planCount = aggregate.metrics.volume.successful; // This is a simplification
        totalAmount += planAOV * planCount;
        totalCount += planCount;
      }
      
      aggregate.metrics.aov.overall = totalCount > 0 ? totalAmount / totalCount : 0;
    }
  });
  
  return hourlyAggregates;
}

function aggregateOrdersDaily(orders) {
  const dailyAggregates = {};
  
  // Group orders by merchant and day
  orders.forEach(order => {
    const date = new Date(order.timestamp);
    const dayKey = date.toISOString().slice(0, 10) + 'T00:00:00Z'; // Format: 2025-03-19T00:00:00Z
    const merchantId = order.merchantId;
    const key = `${merchantId}/daily/${dayKey}`;
    
    if (!dailyAggregates[key]) {
      dailyAggregates[key] = {
        merchantId,
        granularity: 'daily',
        timestamp: dayKey,
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
          counts: {
            byPaymentPlan: {},
            byProduct: {},
          },
        },
      };
    }
    
    const aggregate = dailyAggregates[key];
    
    // Update volume metrics
    aggregate.metrics.volume.total += 1;
    if (order.status === 'success') {
      aggregate.metrics.volume.successful += 1;
    } else {
      aggregate.metrics.volume.failed += 1;
    }
    
    // Update payment plan counts
    const paymentPlan = order.paymentPlan;
    if (!aggregate.metrics.counts.byPaymentPlan[paymentPlan]) {
      aggregate.metrics.counts.byPaymentPlan[paymentPlan] = 0;
    }
    aggregate.metrics.counts.byPaymentPlan[paymentPlan] += 1;
    
    // Update product counts
    const productId = order.productId;
    if (!aggregate.metrics.counts.byProduct[productId]) {
      aggregate.metrics.counts.byProduct[productId] = 0;
    }
    aggregate.metrics.counts.byProduct[productId] += 1;
    
    // Update AOV metrics (only for successful orders)
    if (order.status === 'success') {
      // Initialize payment plan if it doesn't exist
      if (!aggregate.metrics.aov.byPaymentPlan[paymentPlan]) {
        aggregate.metrics.aov.byPaymentPlan[paymentPlan] = 0;
      }
      
      // Calculate running average for this payment plan
      const currentTotal = aggregate.metrics.aov.byPaymentPlan[paymentPlan] * (aggregate.metrics.volume.successful - 1);
      const newTotal = currentTotal + order.amount;
      aggregate.metrics.aov.byPaymentPlan[paymentPlan] = newTotal / aggregate.metrics.volume.successful;
      
      // Calculate overall AOV
      let totalAmount = 0;
      let totalCount = 0;
      
      for (const plan in aggregate.metrics.aov.byPaymentPlan) {
        const planAOV = aggregate.metrics.aov.byPaymentPlan[plan];
        const planCount = aggregate.metrics.volume.successful; // This is a simplification
        totalAmount += planAOV * planCount;
        totalCount += planCount;
      }
      
      aggregate.metrics.aov.overall = totalCount > 0 ? totalAmount / totalCount : 0;
    }
  });
  
  return dailyAggregates;
}

function writeAggregatesToFiles(aggregates) {
  for (const key in aggregates) {
    const aggregate = aggregates[key];
    const filePath = path.join(TEMP_DIR, `metrics/${key}.json`);
    
    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, JSON.stringify(aggregate, null, 2));
  }
}

function syncToS3() {
  try {
    console.log('Syncing to S3...');
    execSync(`aws --profile lz-demos s3 sync ${TEMP_DIR} s3://${S3_BUCKET_NAME}`, { stdio: 'inherit' });
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error syncing to S3:', error.message);
  }
}

// Main execution
console.log('Generating order history...');
console.log(`Time range: ${ONE_MONTH_AGO.toISOString()} to ${NOW.toISOString()}`);

// Generate orders
const orders = generateHourlyOrders(ONE_MONTH_AGO, NOW);
console.log(`Generated ${orders.length} orders`);

// Aggregate orders
const hourlyAggregates = aggregateOrdersHourly(orders);
console.log(`Created ${Object.keys(hourlyAggregates).length} hourly aggregates`);

const dailyAggregates = aggregateOrdersDaily(orders);
console.log(`Created ${Object.keys(dailyAggregates).length} daily aggregates`);

// Write aggregates to files
console.log('Writing aggregates to files...');
writeAggregatesToFiles({ ...hourlyAggregates, ...dailyAggregates });
console.log(`Files written to ${TEMP_DIR}`);

// Sync to S3
const shouldSync = process.argv.includes('--sync');
if (shouldSync) {
  syncToS3();
} else {
  console.log('Skipping S3 sync. Run with --sync to upload to S3.');
  console.log(`To sync manually, run: aws s3 sync ${TEMP_DIR} s3://${S3_BUCKET_NAME}`);
}

console.log('Done!');