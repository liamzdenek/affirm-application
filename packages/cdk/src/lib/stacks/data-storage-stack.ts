import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';

export interface DataStorageStackProps extends StackProps {}

export class DataStorageStack extends Stack {
  // Public properties to be accessed by other stacks
  public readonly ordersTable: Table;

  constructor(scope: Construct, id: string, props?: DataStorageStackProps) {
    super(scope, id, props);

    // Create the DynamoDB table for orders
    this.ordersTable = new Table(this, 'OrdersTable', {
      partitionKey: { name: 'merchantId', type: AttributeType.STRING },
      sortKey: { name: 'orderId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // For demo purposes only, use RETAIN in production
      stream: StreamViewType.NEW_IMAGE, // Enable DynamoDB Streams to trigger Lambda
      pointInTimeRecovery: true,
    });
  }
}