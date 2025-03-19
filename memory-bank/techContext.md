# Technical Context: Merchant Analytics Dashboard

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Tanstack Router
- **Styling**: CSS Modules
- **HTTP Client**: Axios
- **Visualization**: Chart.js or D3.js
- **State Management**: React Query for server state, React Context for local state

### Backend
- **Runtime**: AWS Lambda (Node.js)
- **API Framework**: Express with serverless-http
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **API Gateway**: Amazon API Gateway
- **Infrastructure**: AWS CDK (TypeScript)

### Development Environment
- **Monorepo Management**: NX
- **Language**: TypeScript (strict mode)
- **Package Manager**: npm or yarn
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier

## Development Setup

### Project Structure
```
affirm-merchant-analytics/
├── nx.json                    # NX configuration
├── package.json               # Root package.json
├── packages/                  # All packages in this directory
│   ├── frontend/              # Combined UI application (order form + dashboard)
│   ├── shared/                # Shared types and utilities
│   ├── api/                   # Backend API
│   └── cdk/                   # AWS CDK deployment code
└── README.md                  # Project documentation
```

### Package Initialization Commands

```bash
# Create NX workspace (already done)
# npx create-nx-workspace affirm-merchant-analytics --preset=ts

# Install React plugin
npm install -D @nx/react

# Add frontend application (with TypeScript and Vite)
npx nx g @nx/react:app frontend --directory=packages/frontend --style=css --bundler=vite --js=false --strict

# Install Node.js plugin
npm install -D @nx/node

# Add shared library (with TypeScript)
npx nx g @nx/js:lib shared --directory=packages/shared --buildable --js=false --strict

# Add API library (with TypeScript)
npx nx g @nx/node:lib api --directory=packages/api --buildable --js=false --strict

# Add CDK library (with TypeScript)
npx nx g @nx/js:lib cdk --directory=packages/cdk --buildable --js=false --strict
```

The `--js=false` flag ensures TypeScript is used, and `--strict` enables strict TypeScript checking.

## Key Technical Interfaces

### 1. Order Submission API

```typescript
// Request
interface OrderRequest {
  merchantId: string;
  productId: string;
  amount: number;
  paymentPlan: string;
  simulateFailure: boolean;
}

// Response
interface OrderResponse {
  orderId: string;
  merchantId: string;
  timestamp: string;
  status: 'success' | 'failure';
}
```

### 2. Analytics API

```typescript
// Request (Query Parameters)
interface AnalyticsQuery {
  granularity: 'hourly' | 'daily';
  startDate: string; // ISO format
  endDate: string; // ISO format
}

// Response
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

```typescript
// Request (Query Parameters)
interface RecentOrdersQuery {
  limit?: number; // Default: 10
  status?: 'success' | 'failure'; // Optional filter
}

// Response
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

## Data Models

### DynamoDB Schema

**Orders Table**:
- Partition Key: `merchantId` (String)
- Sort Key: `orderId` (String)
- Attributes:
  - `timestamp` (String): ISO format timestamp
  - `amount` (Number): Order amount
  - `paymentPlan` (String): Selected payment plan
  - `status` (String): 'success' or 'failure'
  - `productId` (String): Product identifier

### S3 Data Format

**Aggregated Metrics**:
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

## Technical Constraints

1. **Serverless Architecture**: All backend components must be serverless to minimize operational overhead.
2. **TypeScript Only**: All code must be written in TypeScript with strict type checking.
3. **Single Lambda for API**: All API endpoints must be handled by a single Lambda function using Express.
4. **No Fallbacks**: The system should fail fast rather than implementing complex fallback mechanisms.
5. **Merchant Granularity**: Analytics must always be queried at the merchant level.
6. **Limited Time Granularity**: Only hourly and daily aggregations are supported.
7. **Limited Metrics**: Only AOV and volume metrics are implemented.
8. **CSS Modules Only**: No inline styles or CSS frameworks like Tailwind.
9. **AWS-Native**: All infrastructure must use AWS services.
10. **CDK Deployment**: All infrastructure must be deployable via AWS CDK.

## Development Workflow

1. **Local Development**:
   - Frontend: `nx serve frontend`
   - Backend: Local Express server with simulated DynamoDB and S3

2. **Testing**:
   - Unit Tests: `nx test [package]`
   - Integration Tests: Test against local DynamoDB and S3 emulators

3. **Deployment**:
   - CDK Deployment: `nx run cdk:deploy`
   - Frontend Deployment: S3 + CloudFront via CDK

4. **Monitoring**:
   - CloudWatch Logs for Lambda functions
   - CloudWatch Metrics for API Gateway and Lambda
   - S3 Access Logs for frontend

## Implementation Details

### API Implementation

1. **Express with serverless-http**:
   - Single Lambda function for all API endpoints
   - Express middleware for CORS, JSON parsing, etc.
   - Serverless-http for Lambda integration

2. **DynamoDB Integration**:
   - AWS SDK v3 for DynamoDB
   - DynamoDBDocumentClient for easier interaction
   - PutCommand for storing orders
   - QueryCommand for retrieving orders

3. **S3 Integration**:
   - AWS SDK v3 for S3
   - ListObjectsV2Command for listing objects
   - GetObjectCommand for retrieving objects
   - PutObjectCommand for storing objects

4. **Aggregation Logic**:
   - DynamoDB Streams for real-time aggregation
   - Lambda function triggered by DynamoDB Streams
   - S3 for storing aggregated data
   - Partitioning by merchant ID, granularity, and timestamp

### Frontend Implementation

1. **Configuration System**:
   - Environment variables for API base URL
   - Different values for development and production
   - Vite configuration for environment variables

2. **API Integration**:
   - Axios for HTTP requests
   - React Query for data fetching and caching
   - Error handling and loading states

3. **Visualization**:
   - Chart.js for data visualization
   - Line charts for time series data
   - Responsive design for different screen sizes

### Debugging and Logging

1. **Lambda Logging**:
   - Extensive console.log statements
   - Structured logging with JSON.stringify
   - Environment variable logging

2. **API Logging**:
   - Request and response logging
   - Error logging with stack traces
   - Performance metrics logging

3. **S3 Operation Logging**:
   - Object key logging
   - Operation result logging
   - Error details logging

## Performance Considerations

1. **DynamoDB Capacity**: Use on-demand capacity for simplicity in this demo.
2. **Lambda Memory**: Allocate sufficient memory to minimize cold start times.
3. **S3 Partitioning**: Structure S3 keys to optimize for common query patterns.
4. **API Caching**: Consider enabling API Gateway caching for frequently accessed data.
5. **Frontend Optimization**: Implement code splitting and lazy loading for optimal performance.