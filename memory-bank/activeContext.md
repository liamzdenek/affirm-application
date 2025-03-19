# Active Context: Merchant Analytics Dashboard

## Current Status

We are at the initial planning and architecture phase of the Merchant Analytics Dashboard project. The architecture has been defined and documented, and we are preparing to begin implementation.

## Recent Decisions

1. **Combined UI Application**: Decided to combine the order form and dashboard into a single UI application to simplify development for this demo project.

2. **Single Lambda for API**: Opted to use a single Lambda function with Express and serverless-http for all API endpoints to reduce complexity and cold start times.

3. **Specific Metrics Focus**: Defined two key metrics to focus on: Average Order Value (AOV) and Volume, with hourly and daily granularity.

4. **Merchant Granularity Requirement**: Decided to always require merchant granularity for analytics queries, removing the option to query across all merchants.

5. **TypeScript Enforcement**: Confirmed that all components will be written in TypeScript with strict type checking.

6. **NX Command Verification**: Verified the NX commands to ensure they initialize packages with TypeScript support.

## Current Focus Areas

1. **Project Initialization**: Setting up the NX monorepo structure and initializing all packages.

2. **Interface Definition**: Finalizing the API contracts and data models between system components.

3. **AWS Infrastructure**: Defining the CDK stacks for DynamoDB, Lambda, API Gateway, and S3.

4. **Frontend Structure**: Planning the React component hierarchy and state management approach.

## Key Considerations

1. **Demo Scope**: This is a one-day project meant to demonstrate technical capabilities and business value alignment, so we're focusing on core functionality without extensive error handling or edge cases.

2. **AWS Native**: All backend components are AWS native to showcase cloud architecture expertise.

3. **Real-time Data Flow**: The system demonstrates a complete data flow from order placement to visualization, emphasizing the real-time nature of the analytics.

4. **Merchant Value**: The dashboard is designed to provide clear value to merchants by helping them understand the impact of offering Affirm.

## Next Steps

1. **Initialize NX Workspace**: Create the NX monorepo and initialize all packages with the correct TypeScript settings.

2. **Implement Data Storage**: Set up the DynamoDB table and stream configuration.

3. **Develop Aggregation Logic**: Implement the Lambda function for processing DynamoDB stream events and calculating metrics.

4. **Create API Endpoints**: Build the Express application with routes for order submission and analytics retrieval.

5. **Develop Frontend**: Implement the React application with order form and dashboard views.

6. **Deploy Infrastructure**: Use CDK to deploy all components to AWS.

7. **Test End-to-End**: Verify the complete data flow from order submission to analytics visualization.

## Open Questions

1. **Sample Data**: What sample merchants and products should we include for demonstration purposes?

2. **Payment Plans**: What Affirm payment plans should we simulate in the order form?

3. **Visualization Style**: What chart types would best represent the AOV and volume metrics?

4. **Time Range**: What default time range should the dashboard display?

## Recent Changes

The architecture has evolved through several iterations:

1. Initial concept focused on a merchant integration health monitor
2. Shifted to a merchant analytics dashboard based on user preference
3. Updated to combine order form and dashboard into a single UI application
4. Refined to use a single Lambda for all API endpoints
5. Specified metrics (AOV and Volume) and granularities (hourly and daily)
6. Removed customerSegment attribute as it wasn't adding value
7. Enforced merchant-specific granularity for all analytics queries