# System Patterns: Merchant Analytics Dashboard

## Architectural Overview

The Merchant Analytics Dashboard follows a serverless, event-driven architecture with clear separation of concerns. The system is designed to be scalable, cost-effective, and maintainable.

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

## Key Architectural Patterns

### 1. Event-Driven Processing

The system uses DynamoDB Streams to trigger real-time processing of new order data. This event-driven approach:

- Decouples data storage from processing logic
- Enables real-time updates without polling
- Scales automatically with transaction volume
- Provides built-in retry mechanisms

### 2. Single-Responsibility Microservices

Each component has a clear, focused responsibility:

- **Data Storage**: Persist order data reliably
- **Aggregation Engine**: Transform raw data into meaningful metrics
- **API Gateway**: Expose data to clients securely
- **Frontend**: Present data in an intuitive interface

### 3. Materialized View Pattern

The system pre-computes and stores aggregated metrics rather than calculating them on-demand:

- Improves read performance for frequently accessed data
- Reduces computational load during API requests
- Enables efficient time-series analysis
- Separates write and read optimization concerns

### 4. API-First Design

All interactions between frontend and backend occur through well-defined APIs:

- Enables independent evolution of frontend and backend
- Facilitates testing and documentation
- Provides a clear contract between components
- Allows for potential future integrations

### 5. Infrastructure as Code

All infrastructure is defined and deployed using AWS CDK:

- Ensures consistent environments
- Enables version control of infrastructure
- Facilitates automated deployment
- Reduces configuration errors

## Data Flow Patterns

### 1. Write Path

```
Order Form → API Gateway → Lambda → DynamoDB → DynamoDB Stream → Aggregation Lambda → S3
```

- User submits an order via the frontend
- API Gateway routes the request to a Lambda function
- Lambda validates and stores the order in DynamoDB
- DynamoDB Stream triggers the Aggregation Lambda
- Aggregation Lambda computes metrics and stores them in S3

### 2. Read Path

```
Dashboard → API Gateway → Lambda → S3 → Dashboard
```

- User requests analytics via the dashboard
- API Gateway routes the request to a Lambda function
- Lambda retrieves pre-computed metrics from S3
- Dashboard displays the metrics to the user

## Key Technical Decisions

### 1. Single Lambda for API Endpoints

**Decision**: Use a single Lambda function with Express and serverless-http for all API endpoints.

**Rationale**:
- Reduces cold start latency by reusing the same Lambda
- Simplifies deployment and management
- Leverages familiar Express routing patterns
- Enables shared middleware and error handling

### 2. DynamoDB for Primary Storage

**Decision**: Use DynamoDB as the primary data store.

**Rationale**:
- Provides consistent single-digit millisecond performance
- Scales automatically with no capacity planning
- Offers built-in event streaming via DynamoDB Streams
- Integrates seamlessly with other AWS services

### 3. S3 for Aggregated Data

**Decision**: Store pre-computed aggregates in S3.

**Rationale**:
- Cost-effective for storing large volumes of data
- Highly durable and available
- Supports various access patterns
- Enables easy backup and archiving

### 4. Merchant-Specific Granularity

**Decision**: Always require merchant granularity for analytics queries.

**Rationale**:
- Aligns with merchant-centric business model
- Improves query performance by limiting scope
- Enhances data security and isolation
- Simplifies authorization logic

### 5. Hourly and Daily Aggregation

**Decision**: Pre-compute metrics at both hourly and daily granularities.

**Rationale**:
- Balances detail and performance
- Supports different analysis timeframes
- Enables trend identification at multiple scales
- Optimizes storage and query efficiency

### 6. NX Monorepo Structure

**Decision**: Organize code as an NX monorepo with packages in "./packages/".

**Rationale**:
- Facilitates code sharing between packages
- Enables consistent tooling across the project
- Supports incremental builds and testing
- Simplifies dependency management

## Error Handling Patterns

**Decision**: Implement a "fail fast" approach with no fallbacks.

**Rationale**:
- Simplifies implementation for a demo project
- Makes failures visible and explicit
- Focuses on the happy path for demonstration
- Logs failures for troubleshooting

## Future Extensibility

The architecture supports several potential extensions:

1. **Real-time Updates**: WebSocket support for live dashboard updates
2. **Additional Metrics**: New aggregations without changing the core architecture
3. **Historical Analysis**: Longer-term data retention and analysis
4. **Multi-tenant Support**: Scaling to support many merchants
5. **Authentication**: Integration with Affirm's authentication system