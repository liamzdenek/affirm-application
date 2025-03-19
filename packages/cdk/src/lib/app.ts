import { App } from 'aws-cdk-lib';
import { DataStorageStack } from './stacks/data-storage-stack';
import { LambdaStack } from './stacks/lambda-stack';
import { ApiGatewayStack } from './stacks/api-gateway-stack';
import { S3Stack } from './stacks/s3-stack';
import { FrontendStack } from './stacks/frontend-stack';

// Create the CDK app
const app = new App();

// Define the environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create the stacks
const dataStorageStack = new DataStorageStack(app, 'MerchantAnalytics-DataStorage', { env });
const s3Stack = new S3Stack(app, 'MerchantAnalytics-S3', { env });
const lambdaStack = new LambdaStack(app, 'MerchantAnalytics-Lambda', {
  env,
  ordersTable: dataStorageStack.ordersTable,
  aggregatedDataBucket: s3Stack.aggregatedDataBucket,
});
const apiGatewayStack = new ApiGatewayStack(app, 'MerchantAnalytics-ApiGateway', {
  env,
  apiHandler: lambdaStack.apiHandler,
});
const frontendStack = new FrontendStack(app, 'MerchantAnalytics-Frontend', {
  env,
  apiEndpoint: apiGatewayStack.apiEndpoint,
});

// Add dependencies
lambdaStack.addDependency(dataStorageStack);
lambdaStack.addDependency(s3Stack);
apiGatewayStack.addDependency(lambdaStack);
frontendStack.addDependency(apiGatewayStack);

// Synthesize the app
app.synth();