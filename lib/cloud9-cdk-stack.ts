import * as cdk from '@aws-cdk/core';
import * as cloud9 from '@aws-cdk/aws-cloud9';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import {
  CfnInstanceProfile,
  CompositePrincipal,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal
} from '@aws-cdk/aws-iam';

export class Cloud9CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', { isDefault: true });
    new cloud9.CfnEnvironmentEC2(this, 'Cloud9Env', {
       name: this.node.tryGetContext("name"),
       instanceType: this.node.tryGetContext("instance_type"),
       automaticStopTimeMinutes: 60,
       connectionType: "CONNECT_SSM",
    });

    const role = new iam.Role(this, 'AWSCloud9SSMAccessRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('cloud9.amazonaws.com'),
        new ServicePrincipal('ec2.amazonaws.com')
      ),
      roleName: 'AWSCloud9SSMAccessRole',
      description: 'Service linked role for AWS Cloud9',
      path: '/service-role/',
      managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AWSCloud9SSMInstanceProfile'),
      ]
    });

    const profile = new CfnInstanceProfile(this, 'cloud9', {
      instanceProfileName: 'AWSCloud9SSMInstanceProfile',
      roles: ['AWSCloud9SSMAccessRole'],
      path: '/cloud9/'
    })
  }
}
