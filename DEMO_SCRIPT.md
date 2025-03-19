# Demo Script: Affirm Merchant Analytics Dashboard

1. Introduction (1 minute)
2. Technical Architecture & Implementation (1.5 minutes)
3. User Experience & Business Impact (1 minute)
4. Real-time Analytics Demo (1.5 minutes)
5. Conclusion & Why Affirm (1 minute)

## 1. Introduction (1 minute)
1. Hello, I'm Liam. I'm a hands-on SWE with 14 years of experience and a track record of delivering technical impact that drives business outcomes.
2. I'm interested in the Senior Staff Software Engineer role at Affirm, and I'd like to demonstrate my technical capabilities and business alignment.
3. Instead of a traditional application, I've built a functional demo that showcases both my technical skills and my understanding of Affirm's business needs.
4. I've created a Merchant Analytics Dashboard that addresses a critical challenge in the BNPL space: merchant visibility into the business impact of offering Affirm.
5. This dashboard helps merchants understand the impact of offering Affirm as a payment option, which is critical for merchant adoption and retention in a competitive BNPL landscape.
6. Unlike traditional payment methods, BNPL providers need to demonstrate clear ROI to merchants to drive adoption and reduce churn.
7. This tool demonstrates how real-time analytics can bridge this gap by providing merchants with actionable insights into how Affirm affects their business metrics.
8. I completed this end-to-end implementation in just one day, demonstrating my ability to rapidly ship valuable features that could enhance Affirm's merchant value proposition.

## 2. Technical Architecture & Implementation (1.5 minutes)
1. Let me walk you through the technical implementation that showcases my versatility across the full stack:
   1. Order submission through a form interface
   2. Real-time data processing via DynamoDB Streams
   3. Aggregation of metrics by merchant, time period, and payment plan
   4. Serverless API for data retrieval
   5. Interactive dashboard for visualization
   6. Everything deployed with AWS CDK

2. Technical Implementation Details
   1. Modern React frontend with TypeScript, Vite, and CSS Modules
   2. Serverless backend using AWS Lambda with Express
   3. Event-driven architecture with DynamoDB Streams
   4. Materialized view pattern with S3 for aggregated metrics
   5. Infrastructure as code using AWS CDK
   6. NX monorepo for efficient project organization

3. The system follows a serverless architecture with these key components:
   1. DynamoDB for order data persistence
   2. Lambda function triggered by DynamoDB Stream for real-time aggregates
   3. S3 storage for aggregated metrics
   4. API Gateway with a single Lambda function using Express
   5. React frontend hosted on S3 with CloudFront distribution

4. The aggregation Lambda function is particularly powerful:
   1. It's triggered automatically by DynamoDB Streams as new orders arrive
   2. It calculates key metrics like AOV and volume in real-time
   3. It segments data by payment plan to show how different financing options affect AOV
   4. It tracks successful and failed payments separately
   5. It maintains both hourly and daily granularities for different analysis needs

5. I focused on building a production-ready solution that demonstrates both technical excellence and practical business value, which I believe is what Affirm is looking for in this role.

## 3. User Experience & Business Impact (1 minute)
1. Let me show you the application from a user's perspective:
   1. Clean, intuitive dashboard with key metrics
   2. Merchant selector for viewing analytics across different merchants
   3. Time granularity toggle between hourly and daily views
   4. Payment plan breakdown showing AOV by payment plan
   5. Volume metrics with successful vs. failed payment tracking
   6. Recent orders feed showing the latest transactions
   7. Order simulation form for testing different scenarios
   8. Auto-refresh functionality that updates every 60 seconds, with tab focus detection to pause refresh when the tab is not visible

2. This tool delivers significant value to Affirm's merchant ecosystem:
   1. For merchants: Quantifiable ROI of offering Affirm
   2. For Affirm: Increased merchant adoption and reduced churn
   3. For consumers: Better merchant integrations leading to improved checkout experiences
   4. For the business: Competitive advantage over other BNPL providers

## 4. Real-time Analytics Demo (1.5 minutes)
1. Now, I'll demonstrate the real-time nature of the analytics by simulating some orders.
2. Let's start by submitting a few orders for different merchants with various payment plans.
3. Watch how the dashboard updates in real-time as the orders flow through the system.
4. Notice how the metrics are automatically recalculated and the charts updated.
5. We can also simulate failed payments to see how they're tracked separately.
6. The system supports both hourly and daily granularity, allowing merchants to analyze both immediate trends and longer-term patterns.
7. Let's also look at the payment plan breakdown, which shows how different financing options affect AOV.
8. A key feature is the ability to filter by merchant ID to see merchant-specific analytics. This merchant-centric approach ensures each merchant sees only their relevant data, which was a core requirement for the system.
9. This real-time visibility gives merchants immediate feedback on their Affirm integration performance.

## 5. Conclusion & Why I'm a fit for Affirm (1 minute)
1. This project demonstrates my ability to deliver value in several ways relevant to Affirm:
   1. My focus on solving real business problems, specifically merchant adoption and retention
   2. My technical skills across the full stack: React, TypeScript, serverless architecture, AWS services
   3. My ability to rapidly deliver within a tight timeframe
   4. My understanding of the BNPL space and Affirm's business model
   5. My ability to build systems that provide actionable insights to users, which is a key skill for a Senior Staff Software Engineer

2. I'm particularly excited about Affirm for several reasons:
   1. The mission to deliver honest financial products that improve lives resonates with me
   2. The focus on both technical excellence and business impact aligns with my career goals
   3. The opportunity to work on systems that operate at scale and make a real difference
   4. The chance to contribute to a company that's transforming the financial industry

3. I believe this project demonstrates that I'm ready to contribute to Affirm's engineering organization from day one, bringing both technical expertise and business acumen.
4. Thank you for your consideration, and I look forward to discussing how I can help Affirm continue to innovate and grow.