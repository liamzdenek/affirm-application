# Affirm Merchant Analytics Dashboard - Project Intelligence

## Project Patterns

### Naming Conventions
- **React Components**: PascalCase (e.g., `OrderForm.tsx`, `MetricsChart.tsx`)
- **Utility Functions**: camelCase (e.g., `formatCurrency.ts`, `calculateAOV.ts`)
- **API Endpoints**: kebab-case (e.g., `/merchants/{merchantId}/analytics`)
- **Database Attributes**: camelCase (e.g., `merchantId`, `paymentPlan`)
- **S3 Keys**: kebab-case with slashes (e.g., `metrics/hourly/merchant-123/2025-03-19T12:00:00Z.json`)

### Code Organization
- **Frontend Components**: Organized by feature, not by type
- **API Routes**: Grouped by resource (e.g., orders, merchants, analytics)
- **Shared Types**: Defined in the shared package and imported where needed
- **CSS Modules**: Named same as component with `.module.css` extension

### Development Workflow
- **Feature Development**: Start with shared types, then backend, then frontend
- **Testing**: Write tests alongside implementation, not after
- **Commits**: Atomic commits with descriptive messages
- **Documentation**: Update memory bank after significant changes

## User Preferences

### Technical Preferences
- **TypeScript**: Strict mode enabled for all packages
- **CSS Approach**: CSS Modules preferred over inline styles or Tailwind
- **AWS Services**: Prefer AWS-native solutions
- **Deployment**: AWS CDK for all infrastructure
- **Monorepo Structure**: NX with packages in "./packages/"

### Project Specifics
- **Metrics Focus**: AOV and Volume are the primary metrics
- **Time Granularity**: Hourly and daily reporting periods
- **Merchant Granularity**: Always require merchant-specific queries
- **API Design**: Single Lambda with Express for all endpoints
- **UI Integration**: Combined order form and dashboard in single UI application

## Known Challenges

### Technical Challenges
- **Cold Start Latency**: Lambda cold starts may affect API responsiveness
- **DynamoDB Stream Processing**: Ensuring all events are processed correctly
- **Real-time Updates**: Balancing freshness with performance
- **Cross-package Dependencies**: Managing dependencies in monorepo structure

### Project Challenges
- **One-day Timeline**: Balancing scope with quality
- **Demo Data**: Creating realistic but simplified test data
- **Error Handling**: Implementing basic error handling without overcomplicating

## Evolution of Decisions

### Architecture Evolution
1. Initial concept focused on merchant integration health monitor
2. Shifted to merchant analytics dashboard based on user preference
3. Updated to combine order form and dashboard into single UI application
4. Refined to use single Lambda for all API endpoints
5. Specified metrics (AOV and Volume) and granularities (hourly and daily)
6. Removed customerSegment attribute as it wasn't adding value
7. Enforced merchant-specific granularity for all analytics queries

### Technical Decisions
1. Chose NX for monorepo management to simplify cross-package dependencies
2. Selected Express with serverless-http for familiar API development pattern
3. Decided on DynamoDB Streams for real-time processing to avoid polling
4. Opted for S3 storage of aggregates for cost-effectiveness and simplicity
5. Selected React with Vite for frontend development speed

## Tool Usage Patterns

### AWS CDK
- Use TypeScript for all CDK constructs
- Organize stacks by resource type
- Use environment variables for configuration

### NX
- Use NX generators to create new packages and components
- Leverage NX's dependency graph for efficient builds
- Use NX's affected commands for targeted testing

### React
- Use functional components with hooks
- Implement custom hooks for reusable logic
- Use React Query for API data fetching and caching

### TypeScript
- Enable strict mode for all packages
- Define interfaces in shared package
- Use type guards for runtime type checking