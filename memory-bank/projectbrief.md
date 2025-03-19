# Project Brief: Merchant Analytics Dashboard

## Project Overview
The Merchant Analytics Dashboard is a real-time analytics platform for Affirm merchants to visualize customer conversion rates, AOV increases, and payment plan selection patterns. This system will help merchants understand the impact of offering Affirm as a payment option and optimize their integration for maximum benefit.

## Core Requirements

1. **Real-time Analytics**: Provide merchants with up-to-the-minute data on their Affirm integration performance
2. **Multi-merchant Support**: Allow simulation of different merchant scenarios
3. **Failed Payment Insights**: Track and analyze failed payments separately
4. **Interactive Dashboard**: Visualize key metrics in an intuitive interface
5. **Order Simulation**: Include a form to generate sample order data
6. **AWS-native Backend**: Utilize AWS services for all backend functionality
7. **Infrastructure as Code**: Deploy all components using AWS CDK

## Technical Constraints

1. NX monorepo structure with packages in "./packages/"
2. DynamoDB for order persistence
3. AWS Lambda function triggered by DynamoDB Stream for real-time aggregates
4. S3 storage for aggregated data
5. API Gateway with a single Lambda function using Express and serverless-http
6. React + Vite + TypeScript for frontend
7. Tanstack Router for navigation
8. CSS Modules for styling (no inline styles or Tailwind)
9. No fallback implementations - main path succeeds or fails with logging
10. All components written in TypeScript
11. Reporting granularities: hourly and daily
12. Key metrics: AOV (Average Order Value) and Volume
13. Always require merchant granularity (no option to return data for all merchants)

## Success Criteria

1. Merchants can view real-time analytics on their Affirm integration
2. Users can simulate orders for multiple merchants
3. Failed payments are tracked and visualized separately
4. All components are deployable via AWS CDK
5. The system demonstrates a complete data flow from order placement to visualization

## Business Value

- **Data-Driven Decisions**: Empower merchants with real-time insights about their Affirm integration
- **Increased Merchant Adoption**: Demonstrate clear ROI for using Affirm
- **Reduced Merchant Churn**: Provide value beyond payment processing
- **Competitive Advantage**: Differentiate from other BNPL providers with superior analytics
- **Merchant Obsession**: Help merchants identify opportunities to improve conversion

## Timeline

This is designed as a one-day project to demonstrate technical capabilities and business value alignment.