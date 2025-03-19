# Merchant Analytics Dashboard - Architecture

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
6. Backend HTTP API via API Gateway to serve real-time aggregates
7. React + Vite + TypeScript dashboard with Tanstack Router and CSS Modules
8. No fallbacks - main path succeeds or fails with logging
9. CDK for deployment

## System Architecture

The system will be built as a monorepo using NX, with AWS-native backend services deployed via AWS CDK:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Merchant Analytics Dashboard                     │
│                                                                         │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤
│             │             │             │             │                 │
│  Order      │  Data       │ Aggregation │ API         │  Dashboard      │
│  Simulation │  Storage    │ Engine      │ Gateway     │  UI             │
│             │             │             │             │                 │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘
```

### Project Structure (NX Monorepo)

```
affirm-merchant-analytics/
├── nx.json                    # NX configuration
├── package.json               # Root package.json
├── packages/                  # All packages in this directory
│   ├── order-form/            # Order simulation UI
│   │   ├── src/               # Source code
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── package.json       # Package configuration
│   ├── dashboard/             # Analytics dashboard UI
│   │   ├── src/               # Source code
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── package.json       # Package configuration
│   ├── shared/                # Shared types and utilities
│   │   ├── src/               # Source code
│   │   └── package.json       # Package configuration
│   ├── api/                   # Backend API
│   │   ├── src/               # Source code
│   │   └── package.json       # Package configuration
│   └── cdk/                   # AWS CDK deployment code
│       ├── lib/               # CDK stacks
│       ├── bin/               # CDK app entry point
│       └── package.json       # Package configuration
└── README.md                  # Project documentation
```

### 1. Order Simulation UI (packages/order-form)

**Responsibility**: Provide a UI for simulating orders across multiple merchants

**Key Components**:
- **Merchant Selection**: Dropdown to select different merchants
- **Product Selection**: Sample products with different price points
- **Payment Options**: Different Affirm payment plans
- **Order Submission**: Form to submit orders to the backend
- **Failed Payment Simulation**: Option to simulate payment failures

**Technologies**:
- React
- TypeScript
- Vite
- Tanstack Router
- CSS Modules
- Axios for API calls

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
    - `customerSegment`: Type of customer (optional)

**AWS Services**:
- Amazon DynamoDB
- DynamoDB Streams (to trigger Lambda)

### 3. Aggregation Engine (Lambda)

**Responsibility**: Process order data in real-time to generate analytics

**Key Components**:
- **Stream Processor**: Lambda function triggered by DynamoDB Streams
- **Aggregation Logic**: Calculate metrics like:
  - Total orders per merchant
  - Average order value
  - Conversion rate by payment plan
  - Failed payment rate
  - Time-based trends
- **S3 Writer**: Store aggregated data in S3 for retrieval

**AWS Services**:
- AWS Lambda
- Amazon S3

### 4. API Gateway

**Responsibility**: Serve real-time aggregates to the frontend

**Key Components**:
- **REST API**: Endpoints for retrieving analytics data
  - `GET /merchants/{merchantId}/analytics`: Get analytics for a specific merchant
  - `GET /merchants/{merchantId}/orders`: Get recent orders for a merchant
  - `POST /orders`: Submit a new order
- **Lambda Integration**: Connect API endpoints to Lambda functions

**AWS Services**:
- Amazon API Gateway
- AWS Lambda (for API handlers)

### 5. Dashboard UI (packages/dashboard)

**Responsibility**: Visualize analytics data for merchants

**Key Components**:
- **Overview Page**: High-level metrics across all merchants
- **Merchant Detail**: Detailed analytics for a selected merchant
- **Charts and Graphs**: Visual representation of key metrics
- **Real-time Updates**: Polling or WebSocket for live data

**Technologies**:
- React
- TypeScript
- Vite
- Tanstack Router
- CSS Modules
- Chart.js or D3.js for visualizations
- Axios for API calls

## Data Flow

1. **Order Placement**: User submits an order via the Order Simulation UI
2. **Data Storage**: Order is stored in DynamoDB
3. **Stream Processing**: DynamoDB Stream triggers Lambda function
4. **Aggregation**: Lambda calculates updated metrics and stores in S3
5. **API Access**: Dashboard UI requests data via API Gateway
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

1. **Basic Order Form**: Simple UI for submitting orders for 2-3 sample merchants
2. **Core Data Flow**: DynamoDB storage, Lambda processing, and S3 storage
3. **Simple API**: Basic endpoints for retrieving aggregated data
4. **Minimal Dashboard**: Key metrics visualization for merchant performance
5. **CDK Deployment**: Complete infrastructure as code setup

This would demonstrate the architecture and value while being feasible within a one-day timeframe.