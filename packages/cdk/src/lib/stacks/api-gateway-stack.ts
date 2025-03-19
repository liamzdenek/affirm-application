import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaRestApi, Cors } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface ApiGatewayStackProps extends StackProps {
  apiHandler: NodejsFunction;
}

export class ApiGatewayStack extends Stack {
  // Public properties to be accessed by other stacks
  public readonly apiEndpoint: string;
  public readonly api: LambdaRestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const { apiHandler } = props;

    // Create the API Gateway
    this.api = new LambdaRestApi(this, 'MerchantAnalyticsApi', {
      handler: apiHandler,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // Store the API endpoint URL
    this.apiEndpoint = this.api.url;

    // Output the API endpoint URL
    new CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'The URL of the API Gateway',
      exportName: 'MerchantAnalyticsApiEndpoint',
    });
  }
}