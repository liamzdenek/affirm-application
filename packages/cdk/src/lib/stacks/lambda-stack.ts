import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, Function } from 'aws-cdk-lib/aws-lambda';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

export interface LambdaStackProps extends StackProps {
  ordersTable: Table;
  aggregatedDataBucket: Bucket;
}

export class LambdaStack extends Stack {
  // Public properties to be accessed by other stacks
  public readonly apiHandler: Function;
  public readonly aggregationHandler: Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { ordersTable, aggregatedDataBucket } = props;

    console.log('loading code from directory', path.join(__dirname, '../../../../../../'));
    console.log('loading code from directory', path.join(__dirname, '../../../../../../packages/api/dist/api'));

    // Create the API Lambda function
    this.apiHandler = new Function(this, 'ApiHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, '../../../../../../packages/api/dist/api')),
      timeout: Duration.seconds(30),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        AGGREGATED_DATA_BUCKET: aggregatedDataBucket.bucketName,
        ORDERS_TABLE: ordersTable.tableName,
      },
    });

    // Grant the API Lambda function read/write access to the DynamoDB table
    ordersTable.grantReadWriteData(this.apiHandler);

    // Grant the API Lambda function read access to the S3 bucket
    aggregatedDataBucket.grantRead(this.apiHandler);

    // Create the Aggregation Lambda function
    this.aggregationHandler = new Function(this, 'AggregationHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'aggregation.handler',
      code: Code.fromAsset(path.join(__dirname, '../../../../../../packages/api/dist/aggregation')),
      timeout: Duration.seconds(60),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        AGGREGATED_DATA_BUCKET: aggregatedDataBucket.bucketName,
        ORDERS_TABLE: ordersTable.tableName,
      },
    });

    // Add DynamoDB Stream as an event source for the Aggregation Lambda
    this.aggregationHandler.addEventSource(new DynamoEventSource(ordersTable, {
      startingPosition: StartingPosition.LATEST,
      batchSize: 100,
      retryAttempts: 3,
    }));

    // Grant the Aggregation Lambda function read access to the DynamoDB table
    ordersTable.grantReadData(this.aggregationHandler);

    // Grant the Aggregation Lambda function write access to the S3 bucket
    aggregatedDataBucket.grantWrite(this.aggregationHandler);

    // Add CloudWatch Logs permissions
    this.apiHandler.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    this.aggregationHandler.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));
  }
}