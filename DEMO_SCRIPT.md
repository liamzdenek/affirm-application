# Demo Script: Affirm Merchant Analytics Dashboard

1. Introduction (1 minute)
2. Technical Architecture & Implementation (1.5 minutes)
3. User Experience & Business Impact (1 minute)
4. Real-time Analytics Demo (1.5 minutes)
5. Conclusion & Why Affirm (1 minute)

## 1. Introduction (1 minute)
1. Hello Vishal, Geddes, Libor, and the team at Affirm. I'm Liam. I'm a hands-on SWE with 14 YOE and a track record of extraordinary technical impact.
2. I'm interested in working in Engineering at Affirm.
3. Instead of a traditional application, I've built a functional demo that showcases both my technical skills and my understanding of Affirm's business needs.
4. I've created a Merchant Analytics Dashboard that addresses a critical challenge in the BNPL space: visibility into the business impact of offering Affirm.
5. This dashboard helps merchants and Affirm's commercial partners understand the impact of offering Affirm as a payment option. This is critical for adoption and retention of merchants and commercial partners in a competitive BNPL landscape.
6. Unlike traditional payment methods, BNPL providers need to demonstrate clear value to commercial partners such as Shopify to drive adoption and reduce churn.
7. This tool demonstrates how real-time analytics can bridge this gap by providing merchants and commercial partners with actionable insights into how Affirm affects their core business metrics.
8. I completed this end-to-end implementation in just one day, demonstrating my ability to rapidly ship valuable features that could enhance Affirm's value proposition.

## 2. Technical Architecture & Implementation (1.5 minutes)
1. Overview
   1. First, I created a page to submit orders.
   2. Those orders are submitted to a HTTP API hosted in an AWS Lambda Function via API Gateway
   3. Each order received gets saved into DynamoDB
   4. DynamoDB is configured with a DynamoDB Stream that triggers this aggregation Lambda function
   5. We compute some metrics about the recent transactions in real time and with different granularities, and save snapshots to s3
   6. That same HTTP API from earlier has an analytics endpoint that retrieves the live aggregated metrics
   7. Those analytics are consumed by our UI application, which uses React.
   8. Then, I made a one-off script to backfill the database with order history so our demo doesn't look empty.
   9. Finally, everything is deployed to AWS with AWS CDK

2. I focused on building a production-ready, highly scalable solution that demonstrates a balance of technical excellence and practical business value, which I believe is what Affirm is looking for in its Engineers.

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
1. Try it out CTA

## 5. Conclusion & Why I'm a fit for Affirm (1 minute)
1. This project demonstrates my ability to deliver value in several ways relevant to Affirm:
   1. My focus on solving real business problems, specifically merchant adoption and retention
   2. I demonstrate expertise in distributed services, data processing pipelines, delivering APIs, and UI too.
   3. I demonstrated my ability to rapidly deliver within a tight timeframe
   4. I believe I've demonstrated that I wont simply meet the bar, I will raise it.

2. I'm particularly excited about Affirm for several reasons:
   1. The mission to deliver honest financial products that improve lives resonates with me, because I'm a person that broadly distrusts credit products.
   2. I'm excited for the opportunity to have impact on critical business outcomes, and to contribute to core product differentiators.
   3. Finally, I believe I can accomplish my major learning goal at Affirm while delivering exceptional impact. (improve my product oriented-thinking)

3. I believe this project demonstrates that I'm ready to contribute to Affirm's engineering organization from day one, bringing both technical expertise and a product mindset.
4. Thank you for your consideration, and I look forward to hearing back.