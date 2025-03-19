import { Stack, Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class LambdaStack extends Stack {
  // Public properties to be accessed by other stacks
  apiHandler;
  aggregationHandler;

  constructor(scope, id, props) {
    super(scope, id, props);

    const { ordersTable, aggregatedDataBucket } = props;

    // Create the API Lambda function
    this.apiHandler = new NodejsFunction(this, 'ApiHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../../../api/src/index.js'),
      timeout: Duration.seconds(30),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        AGGREGATED_DATA_BUCKET: aggregatedDataBucket.bucketName,
      },
    });

    // Grant the API Lambda function read/write access to the DynamoDB table
    ordersTable.grantReadWriteData(this.apiHandler);

    // Grant the API Lambda function read access to the S3 bucket
    aggregatedDataBucket.grantRead(this.apiHandler);

    // Create the Aggregation Lambda function
    this.aggregationHandler = new NodejsFunction(this, 'AggregationHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../../../api/src/aggregation.js'), // This file doesn't exist yet
      timeout: Duration.seconds(60),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        AGGREGATED_DATA_BUCKET: aggregatedDataBucket.bucketName,
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