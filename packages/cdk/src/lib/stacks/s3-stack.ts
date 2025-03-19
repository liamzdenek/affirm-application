import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';

export interface S3StackProps extends StackProps {}

export class S3Stack extends Stack {
  // Public properties to be accessed by other stacks
  public readonly aggregatedDataBucket: Bucket;

  constructor(scope: Construct, id: string, props?: S3StackProps) {
    super(scope, id, props);

    // Create the S3 bucket for aggregated data
    this.aggregatedDataBucket = new Bucket(this, 'AggregatedDataBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY, // For demo purposes only, use RETAIN in production
      autoDeleteObjects: true, // For demo purposes only
      versioned: true,
    });
  }
}