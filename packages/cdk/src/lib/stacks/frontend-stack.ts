import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path';

export interface FrontendStackProps extends StackProps {
  apiEndpoint: string;
}

export class FrontendStack extends Stack {
  // Public properties to be accessed by other stacks
  public readonly frontendBucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { apiEndpoint } = props;

    // Create the S3 bucket for the frontend
    this.frontendBucket = new Bucket(this, 'FrontendBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY, // For demo purposes only, use RETAIN in production
      autoDeleteObjects: true, // For demo purposes only
    });

    // Create an Origin Access Identity for CloudFront
    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
    this.frontendBucket.grantRead(originAccessIdentity);

    // Create the CloudFront distribution
    this.distribution = new Distribution(this, 'FrontendDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(this.frontendBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Deploy the frontend to S3
    // Note: In a real project, you would build the frontend first
    new BucketDeployment(this, 'DeployFrontend', {
      sources: [Source.asset(path.join(__dirname, '../../../../frontend/dist'))],
      destinationBucket: this.frontendBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
      memoryLimit: 1024,
    });

    // Output the CloudFront URL
    new CfnOutput(this, 'FrontendUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'The URL of the CloudFront distribution',
      exportName: 'MerchantAnalyticsFrontendUrl',
    });

    // Output the API endpoint URL
    new CfnOutput(this, 'ApiEndpoint', {
      value: apiEndpoint,
      description: 'The URL of the API Gateway',
      exportName: 'MerchantAnalyticsApiEndpointFromFrontend',
    });
  }
}