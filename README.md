# Merchant Analytics Dashboard

A real-time analytics platform for Affirm merchants to visualize customer conversion rates, AOV increases, and payment plan selection patterns.

## Project Overview

The Merchant Analytics Dashboard is a real-time analytics platform that helps Affirm merchants understand the impact of offering Affirm as a payment option. It provides up-to-the-minute data on key metrics such as Average Order Value (AOV) and transaction volume, allowing merchants to make data-driven decisions to optimize their integration for maximum benefit.

### Core Features

- **Real-time Analytics**: Up-to-the-minute data on Affirm integration performance
- **Multi-merchant Support**: Simulation of different merchant scenarios
- **Failed Payment Insights**: Tracking and analysis of failed payments
- **Interactive Dashboard**: Intuitive visualization of key metrics
- **Order Simulation**: Form to generate sample order data
- **AWS-native Backend**: Utilizing AWS services for all backend functionality
- **Infrastructure as Code**: All components deployed using AWS CDK

## Architecture

The Merchant Analytics Dashboard follows a serverless, event-driven architecture with clear separation of concerns:

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

### Data Flow

#### Write Path
```
Order Form → API Gateway → Lambda → DynamoDB → DynamoDB Stream → Aggregation Lambda → S3
```

#### Read Path
```
Dashboard → API Gateway → Lambda → S3 → Dashboard
```

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Tanstack Router
- **Styling**: CSS Modules
- **HTTP Client**: Axios
- **Visualization**: Chart.js
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
- **Package Manager**: npm
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier

## Project Structure

```
affirm-merchant-analytics/
├── nx.json                    # NX configuration
├── package.json               # Root package.json
├── packages/                  # All packages in this directory
│   ├── frontend/              # Combined UI application (order form + dashboard)
│   ├── shared/                # Shared types and utilities
│   ├── api/                   # Backend API
│   └── cdk/                   # AWS CDK deployment code
├── one-off/                   # One-off scripts and utilities
│   └── order-history-simulation/ # Script to generate simulated order history
└── memory-bank/               # Project documentation
```

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- npm (v7+)
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/affirm-merchant-analytics.git
   cd affirm-merchant-analytics
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build all packages
   ```bash
   npx nx run-many --target=build --all
   ```

## Usage

### Local Development

1. Start the frontend development server
   ```bash
   npx nx serve frontend
   ```

2. Start the API development server
   ```bash
   npx nx serve api
   ```

3. Open your browser and navigate to `http://localhost:4200`

### Order Simulation

1. Navigate to the Order Form page
2. Fill in the form with the desired parameters:
   - Merchant ID
   - Product ID
   - Amount
   - Payment Plan
   - Simulate Failure (optional)
3. Submit the form to generate a new order

### Analytics Dashboard

1. Navigate to the Dashboard page
2. Select a merchant from the dropdown
3. Choose the time granularity (hourly or daily)
4. Select the date range
5. View the analytics data, including:
   - Average Order Value (AOV)
   - Transaction Volume
   - Payment Plan Distribution
   - Product Distribution
   - Recent Orders

## Deployment

### AWS Deployment

1. Synthesize the CDK stack
   ```bash
   npx nx synth cdk
   ```

2. Deploy the CDK stack
   ```bash
   npx nx deploy cdk
   ```

3. The deployment will output the URL of the deployed application

## Development

### Adding a New Feature

1. Identify the package(s) that need to be modified
2. Make the necessary changes
3. Build and test the affected packages
   ```bash
   npx nx affected:build
   npx nx affected:test
   ```
4. Deploy the changes
   ```bash
   npx nx deploy cdk
   ```

### Running Tests

```bash
# Run all tests
npx nx run-many --target=test --all

# Run tests for a specific package
npx nx test frontend
```

## Current Status

The project has been successfully completed with all core features implemented:

- ✅ Real-time Analytics
- ✅ Multi-merchant Support
- ✅ Failed Payment Insights
- ✅ Interactive Dashboard
- ✅ Order Simulation
- ✅ AWS-native Backend
- ✅ Infrastructure as Code

Recent enhancements include:
- ✅ Enhanced metrics to include counts for payment plans and products
- ✅ Added Recent Orders section to the Dashboard
- ✅ Created a script to generate simulated order history data
- ✅ Implemented auto-refresh functionality for the Dashboard

## Future Enhancements

Potential future enhancements include:

1. **Conversion Rate Analysis**: Compare conversion rates with and without Affirm
2. **Customer Segmentation**: Analyze which customer segments prefer which payment plans
3. **Predictive Analytics**: Forecast future transaction volumes and AOV
4. **Competitive Benchmarking**: Compare performance against industry averages
5. **Recommendation Engine**: Suggest optimization opportunities based on data patterns
6. **CI/CD Pipeline**: Set up GitHub Actions for automated testing and deployment
7. **Enhanced Security**: Implement API authentication and WAF protection
8. **Additional Metrics**: Implement more detailed analytics and insights

## Business Value

The Merchant Analytics Dashboard provides significant business value to Affirm and its merchants:

- **Data-Driven Decisions**: Empower merchants with real-time insights about their Affirm integration
- **Increased Merchant Adoption**: Demonstrate clear ROI for using Affirm
- **Reduced Merchant Churn**: Provide value beyond payment processing
- **Competitive Advantage**: Differentiate from other BNPL providers with superior analytics
- **Merchant Obsession**: Help merchants identify opportunities to improve conversion
