import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

export async function GET() {
  try {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT && {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
        },
      }),
    });

    // ListTables (Limit 1) es una operación real y liviana soportada tanto
    // por AWS como por LocalStack — DescribeEndpoints no lo está en LocalStack.
    await client.send(new ListTablesCommand({ Limit: 1 }));

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
