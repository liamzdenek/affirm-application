# Order History Simulation

This script generates simulated order history data for the Merchant Analytics Dashboard. It creates one month of historical data with both hourly and daily granularity, and writes the data to a local temp folder. The script can also optionally sync the data to an S3 bucket.

## Features

- Generates one month of order history data, going back from the current date
- Creates data for both hourly and daily granularity
- Uses the existing three merchants from the application
- Implements natural undulation where sales go up during the daytime and down during nighttime
- Implements natural undulation where sales go up on the weekend but are average during the week
- Writes the simulated files to a temp folder
- Can sync the data to S3 using the AWS CLI

## Usage

1. Make the script executable:

```bash
chmod +x generate-order-history.js
```

2. Run the script to generate data locally:

```bash
./generate-order-history.js
```

3. Run the script with the `--sync` flag to generate data and sync to S3:

```bash
./generate-order-history.js --sync
```

## Configuration

Before running the script with the `--sync` flag, make sure to:

1. Update the `S3_BUCKET_NAME` variable in the script with your actual S3 bucket name
2. Configure your AWS CLI credentials with appropriate permissions to write to the S3 bucket

## Data Structure

The script generates data in the following structure:

```
temp-s3-data/
└── metrics/
    ├── merchant-1/
    │   ├── hourly/
    │   │   ├── 2025-02-19T00:00:00Z.json
    │   │   ├── 2025-02-19T01:00:00Z.json
    │   │   └── ...
    │   └── daily/
    │       ├── 2025-02-19T00:00:00Z.json
    │       ├── 2025-02-20T00:00:00Z.json
    │       └── ...
    ├── merchant-2/
    │   ├── hourly/
    │   │   └── ...
    │   └── daily/
    │       └── ...
    └── merchant-3/
        ├── hourly/
        │   └── ...
        └── daily/
            └── ...
```

Each JSON file contains aggregated metrics for the corresponding merchant, time period, and granularity.

## Data Format

The data format matches the `AggregatedData` interface from the shared package:

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
    counts: {
      byPaymentPlan: {
        [planId: string]: number;
      };
      byProduct: {
        [productId: string]: number;
      };
    };
  };
}