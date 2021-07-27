import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
export class CdkLambdaExampleStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 Use Existing Permissions Boundary
    const permissionsBoundary = iam.ManagedPolicy.fromManagedPolicyName(
      this,
      "serviceboundary",
      "PatternsPermissionsBoundary"
    );

    // 👇 Create role and attach the permissions boundary
    const executionRole: iam.IRole = new iam.Role(
      this,
      "handlers-execution-role",
      {
        roleName: "test-lambda-execution-role",
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Handler Execution Role",
        permissionsBoundary: permissionsBoundary,
        inlinePolicies: {
          cloudwatchPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                ],
                resources: ["*"],
              }),
            ],
          }),
        },
      }
    );

    const myFunc = new lambda.Function(this, "list-items", {
      handler: "hello.handler",
      code: lambda.Code.fromAsset("handler"),
      runtime: lambda.Runtime.NODEJS_14_X,
      role: executionRole,
    });

    cdk.Tags.of(executionRole).add("Project", "Patterns");
    cdk.Tags.of(myFunc).add("Project", "Patterns");
  }
}
