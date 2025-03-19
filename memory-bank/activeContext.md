# Active Context: Merchant Analytics Dashboard

## Current Status

We have made significant progress on the Merchant Analytics Dashboard project. The architecture has been defined and documented, the NX workspace has been initialized, and we have implemented both the frontend and API components. We have also implemented the AWS CDK infrastructure for deployment using TypeScript. We are now working on resolving TypeScript errors and preparing for deployment.

## Recent Decisions

1. **Combined UI Application**: Decided to combine the order form and dashboard into a single UI application to simplify development for this demo project.

2. **Single Lambda for API**: Opted to use a single Lambda function with Express and serverless-http for all API endpoints to reduce complexity and cold start times.

3. **Specific Metrics Focus**: Defined two key metrics to focus on: Average Order Value (AOV) and Volume, with hourly and daily granularity.

4. **Merchant Granularity Requirement**: Decided to always require merchant granularity for analytics queries, removing the option to query across all merchants.

5. **TypeScript Enforcement**: Confirmed that all application code must be written in TypeScript with strict type checking. All CDK infrastructure code has been converted to TypeScript.

6. **NX Command Updates**: Updated the NX commands to use the current plugin names (@nx/react, @nx/node, @nx/js) instead of the outdated ones (@nrwl/react).

7. **Frontend Implementation**: Implemented the frontend with React, Vite, and Tanstack Router, with separate pages for the order form and dashboard.

8. **API Implementation**: Implemented the API with Express and serverless-http, with endpoints for orders and analytics.

9. **CDK Implementation**: Implemented the AWS CDK infrastructure for deployment, including DynamoDB, Lambda, API Gateway, S3, and CloudFront.

10. **Aggregation Lambda**: Implemented a Lambda function triggered by DynamoDB Streams to calculate real-time aggregates.

## Current Focus Areas

1. **TypeScript Errors**: Resolving TypeScript errors related to module resolution and type definitions.

2. **Dependency Installation**: Installing dependencies for the frontend and API packages.

3. **Local Testing**: Testing the application locally before deployment.

4. **Deployment**: Preparing for deployment using AWS CDK.

## Key Considerations

1. **Demo Scope**: This is a one-day project meant to demonstrate technical capabilities and business value alignment, so we're focusing on core functionality without extensive error handling or edge cases.

2. **AWS Native**: All backend components are AWS native to showcase cloud architecture expertise.

3. **Real-time Data Flow**: The system demonstrates a complete data flow from order placement to visualization, emphasizing the real-time nature of the analytics.

4. **Merchant Value**: The dashboard is designed to provide clear value to merchants by helping them understand the impact of offering Affirm.

## Next Steps

1. **Resolve TypeScript Errors**:
   - Fix module resolution issues
   - Add proper type definitions
   - Address any other TypeScript errors

2. **Install Dependencies**:
   ```
   cd packages/frontend && npm install
   cd packages/api && npm install
   ```

3. **Test the Application Locally**:
   ```
   nx serve frontend
   nx serve api
   ```

4. **Deploy the Application Using CDK**:
   ```
   nx run cdk:deploy
   ```

## Open Questions

1. **AWS Account Configuration**: How should we configure the AWS account for deployment?

2. **API Gateway Throttling**: What throttling limits should we set for the API Gateway?

3. **S3 Bucket Lifecycle**: Should we implement lifecycle policies for the S3 bucket storing aggregated data?

4. **CloudFront Distribution**: What cache settings should we use for the CloudFront distribution?

## Recent Changes

The project has evolved through several iterations:

1. Initial concept focused on a merchant integration health monitor
2. Shifted to a merchant analytics dashboard based on user preference
3. Updated to combine order form and dashboard into a single UI application
4. Refined to use a single Lambda for all API endpoints
5. Specified metrics (AOV and Volume) and granularities (hourly and daily)
6. Removed customerSegment attribute as it wasn't adding value
7. Enforced merchant-specific granularity for all analytics queries
8. Updated NX commands to use current plugin names (@nx/react, @nx/node, @nx/js)
9. Implemented frontend with React, Vite, and Tanstack Router
10. Implemented API with Express and serverless-http
11. Implemented AWS CDK infrastructure
12. Implemented aggregation Lambda function
13. Updated package.json files with necessary dependencies
14. Converted all CDK code from JavaScript to TypeScript