# Merchant Analytics Dashboard - Architecture (Final)

## Overview

The Merchant Analytics Dashboard is a real-time analytics platform for Affirm merchants to visualize customer conversion rates, AOV increases, and payment plan selection patterns. This system will help merchants understand the impact of offering Affirm as a payment option and optimize their integration for maximum benefit.

## Business Value

- **Data-Driven Decisions**: Empower merchants with real-time insights about their Affirm integration
- **Increased Merchant Adoption**: Demonstrate clear ROI for using Affirm
- **Reduced Merchant Churn**: Provide value beyond payment processing
- **Competitive Advantage**: Differentiate from other BNPL providers with superior analytics
- **Merchant Obsession**: Help merchants identify opportunities to improve conversion

## Technical Requirements

As specified:

1. NX monorepo structure with packages in "./packages/"
2. Sample "place order" form supporting multiple merchants
3. DynamoDB for order persistence
4. AWS Lambda function triggered by DynamoDB Stream for real-time aggregates, stored in S3
5. Ability to simulate failed payments with separate analytics
6. Backend HTTP API via API Gateway with a SINGLE Lambda function using Express and serverless-http
7. React + Vite + TypeScript for a combined UI application (order form + dashboard)
8. Tanstack Router for navigation between order form and dashboard views
9. CSS Modules (not inline styles, not Tailwind CSS)
10. No fallbacks - main path succeeds or fails with logging
11. CDK for deployment
12. All components written in TypeScript
13. Reporting granularities: hourly and daily
14. Key metrics: AOV (Average Order Value) and Volume
15. Always require merchant granularity (no option to return data for all merchants)

## System Architecture

The system will be built as a monorepo using NX, with AWS-native backend services deployed via AWS CDK:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Merchant Analytics Dashboard                     │
│                                                                         │
├─────────────┬─────────────┬─────────────┬─────────────────────────────┐ │
│             │             │             │                             │ │
│  Data       │ Aggregation │ API         │  Frontend Application       │ │
│  Storage    │ Engine      │ Gateway     │  (Order Form + Dashboard)   │ │
│             │             │             │                             │ │
└─────────────┴─────────────┴─────────────┴─────────────────────────────┘ │
```

### Project Structure (NX Monorepo)

```
affirm-merchant-analytics/
├── nx.json                    # NX configuration
├── package.json               # Root package.json
├── packages/                  # All packages in this directory
│   ├── frontend/              # Combined UI application (order form + dashboard)
│   │   ├── src/               # Source code
│   │   │   ├── pages/         # Pages for order form and dashboard
│   │   │   ├── components/    # Shared components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API services
│   │   │   └── types/         # TypeScript types
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── package.json       # Package configuration
│   ├── shared/                # Shared types and utilities
│   │   ├── src/               # Source code
│   │   └── package.json       # Package configuration
│   ├── api/                   # Backend API
│   │   ├── src/               # Source code
│   │   │   ├── handlers/      # Lambda handlers
│   │   │   ├── routes/        # Express routes
│   │   │   ├── services/      # Business logic
│   │   │   └── types/         # TypeScript types
│   │   └── package.json       # Package configuration
│   └── cdk/                   # AWS CDK deployment code
│       ├── lib/               # CDK stacks
│       ├── bin/               # CDK app entry point
│       └── package.json       # Package configuration
└── README.md                  # Project documentation
```

### 1. Frontend Application (packages/frontend)

**Responsibility**: Provide both order simulation and analytics visualization in a single application

**Key Components**:
- **Order Form Page**:
  - Merchant Selection: Dropdown to select different merchants
  - Product Selection: Sample products with different price points
  - Payment Options: Different Affirm payment plans
  - Order Submission: Form to submit orders to the backend
  - Failed Payment Simulation: Option to simulate payment failures
- **Dashboard Page**:
  - Merchant Selection: Required selection of a specific merchant to view data
  - Charts and Graphs: Visual representation of key metrics
  - Granularity Toggle: Switch between hourly and daily views

**Technologies**:
- React
- TypeScript
- Vite
- Tanstack Router
- CSS Modules
- Axios for API calls
- Chart.js or D3.js for visualizations

### 2. Data Storage (DynamoDB)

**Responsibility**: Store all order data and serve as the source of truth

**Key Components**:
- **Orders Table**: Store all order information
  - Partition Key: `merchantId`
  - Sort Key: `orderId`
  - Attributes:
    - `timestamp`: When the order was placed
    - `amount`: Order total
    - `paymentPlan`: Selected Affirm payment plan
    - `status`: Order status (success/failure)
    - `productId`: Product identifier

**AWS Services**:
- Amazon DynamoDB
- DynamoDB Streams (to trigger Lambda)

### 3. Aggregation Engine (Lambda)

**Responsibility**: Process order data in real-time to generate analytics

**Key Components**:
- **Stream Processor**: Lambda function triggered by DynamoDB Streams
- **Aggregation Logic**: Calculate metrics like:
  - Volume: Total number of orders per merchant
  - AOV: Average Order Value
  - Success/Failure Rates: Percentage of successful vs. failed payments
- **Time-based Aggregation**: Aggregate data at both hourly and daily granularities
- **S3 Writer**: Store aggregated data in S3 for retrieval

**AWS Services**:
- AWS Lambda
- Amazon S3

### 4. API Gateway with Single Lambda

**Responsibility**: Serve real-time aggregates to the frontend and handle order submissions

**Key Components**:
- **Express Application**: Single Express app to handle all routes
- **Serverless HTTP**: Adapter to run Express in Lambda
- **API Routes**:
  - Order submission
  - Analytics retrieval
  - Recent orders retrieval

**AWS Services**:
- Amazon API Gateway
- AWS Lambda (single function for all endpoints)
- Express.js with serverless-http

## Interface Contracts

### 1. Order Submission API

**Endpoint**: `POST /orders`

**Request**:
```typescript
interface OrderRequest {
  merchantId: string;
  productId: string;
  amount: number;
  paymentPlan: string;
  simulateFailure: boolean;
}
```

**Response**:
```typescript
interface OrderResponse {
  orderId: string;
  merchantId: string;
  timestamp: string;
  status: 'success' | 'failure';
}
```

### 2. Analytics API

**Endpoint**: `GET /merchants/{merchantId}/analytics`

**Query Parameters**:
```typescript
interface AnalyticsQuery {
  granularity: 'hourly' | 'daily';
  startDate: string; // ISO format
  endDate: string; // ISO format
}
```

**Response**:
```typescript
interface AnalyticsResponse {
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
    };
  }>;
}
```

### 3. Recent Orders API

**Endpoint**: `GET /merchants/{merchantId}/orders`

**Query Parameters**:
```typescript
interface RecentOrdersQuery {
  limit?: number; // Default: 10
  status?: 'success' | 'failure'; // Optional filter
}
```

**Response**:
```typescript
interface RecentOrdersResponse {
  orders: Array<{
    orderId: string;
    timestamp: string;
    amount: number;
    paymentPlan: string;
    status: 'success' | 'failure';
    productId: string;
  }>;
}
```

### 4. DynamoDB to Lambda

The Lambda function will receive DynamoDB Stream events in the following format:

```typescript
interface DynamoDBStreamEvent {
  Records: Array<{
    eventID: string;
    eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
    dynamodb: {
      Keys: {
        merchantId: { S: string };
        orderId: { S: string };
      };
      NewImage?: {
        merchantId: { S: string };
        orderId: { S: string };
        timestamp: { S: string };
        amount: { N: string };
        paymentPlan: { S: string };
        status: { S: 'success' | 'failure' };
        productId: { S: string };
      };
      OldImage?: Record<string, any>;
      SequenceNumber: string;
      SizeBytes: number;
      StreamViewType: string;
    };
    eventSourceARN: string;
  }>;
}
```

### 5. Lambda to S3

The Lambda function will write aggregated data to S3 in the following format:

```typescript
interface AggregatedData {
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
  };
}
```

## Data Flow

1. **Order Placement**: User submits an order via the Order Form page
2. **Data Storage**: Order is stored in DynamoDB
3. **Stream Processing**: DynamoDB Stream triggers Lambda function
4. **Aggregation**: Lambda calculates updated metrics at hourly and daily granularities and stores in S3
5. **API Access**: Frontend requests data via API Gateway (single Lambda with Express)
6. **Visualization**: Dashboard displays analytics to the user

## AWS CDK Deployment

The system will be deployed using AWS CDK with the following stacks:

```
packages/cdk/lib/
├── data-storage-stack.ts      # DynamoDB tables and streams
├── lambda-stack.ts            # Lambda functions for aggregation and API
├── api-gateway-stack.ts       # API Gateway configuration
├── s3-stack.ts                # S3 buckets for aggregated data
└── frontend-stack.ts          # S3 + CloudFront for hosting frontend
```

## NX Commands for Package Initialization

To initialize the NX workspace and packages, we'll use the following commands:

1. **Create NX workspace** (already done):
   ```
   npx create-nx-workspace affirm-merchant-analytics --preset=ts
   ```

2. **Install React plugin**:
   ```
   npm install -D @nx/react
   ```

3. **Add frontend application** (with TypeScript and Vite):
   ```
   npx nx g @nx/react:app frontend --directory=packages/frontend --style=css --bundler=vite --js=false --strict
   ```

4. **Install Node.js plugin**:
   ```
   npm install -D @nx/node
   ```

5. **Add shared library** (with TypeScript):
   ```
   npx nx g @nx/js:lib shared --directory=packages/shared --buildable --js=false --strict
   ```

6. **Add API library** (with TypeScript):
   ```
   npx nx g @nx/node:lib api --directory=packages/api --buildable --js=false --strict
   ```

7. **Add CDK library** (with TypeScript):
   ```
   npx nx g @nx/js:lib cdk --directory=packages/cdk --buildable --js=false --strict
   ```

The `--js=false` flag ensures TypeScript is used, and `--strict` enables strict TypeScript checking.

## Alignment with Affirm's Needs

This system directly addresses several key points from the Affirm job listings:

1. **Building large-scale distributed systems**: The architecture uses multiple AWS services working together
2. **Data-processing pipeline**: The system implements a real-time data processing pipeline
3. **3rd party developer APIs**: The system provides APIs that merchants can use
4. **User-focused experience**: The dashboard is designed to provide clear value to merchants

## Alignment with Your Experience

This project showcases several aspects of your experience:

1. **Pyrae time-to-value reduction**: The system provides immediate value to merchants
2. **Realtor.com vendor partnerships**: The system strengthens relationships with merchants
3. **Amazon performance optimization**: The architecture is designed for real-time performance
4. **T. Rowe Price frontend experience**: The dashboard demonstrates your frontend expertise

## One-Day Implementation Plan

For a one-day project, we would focus on building a simplified but functional version with:

1. **Basic UI**: Combined order form and dashboard with key metrics
2. **Core Data Flow**: DynamoDB storage, Lambda processing, and S3 storage
3. **Simple API**: Express-based API with serverless-http in a single Lambda
4. **CDK Deployment**: Complete infrastructure as code setup

This would demonstrate the architecture and value while being feasible within a one-day timeframe.