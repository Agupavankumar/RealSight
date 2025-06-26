# DynamoDB Local Setup

This project uses Amazon DynamoDB Local for development. DynamoDB Local is a downloadable version of Amazon DynamoDB that lets you develop and test applications without accessing the DynamoDB web service.

## Prerequisites

- [Java Runtime Environment (JRE) version 11.x or newer](https://www.oracle.com/java/technologies/javase-jre11-downloads.html)
- PowerShell (for running the setup script)

## Starting DynamoDB Local

1. Open a PowerShell terminal
2. Navigate to the project root directory
3. Run the setup script:
.\scripts\start-dynamodb-local.ps1
This script will:
- Download DynamoDB Local if not already present
- Start the DynamoDB Local server on port 1234
- Create a shared database that persists between runs

## Configuration

The application is configured to use DynamoDB Local in development mode through the `appsettings.Development.json` file:
"AWS": {
  "Region": "us-east-1",
  "DynamoDb": {
    "LocalMode": true,
    "LocalServiceUrl": "http://localhost:1234"
  }
}
## Verifying DynamoDB Local is Running

You can verify DynamoDB Local is running by:

1. Opening a new PowerShell terminal
2. Running the AWS CLI command:
aws dynamodb list-tables --endpoint-url http://localhost:1234
## AWS CLI for DynamoDB Local

If you have the AWS CLI installed, you can interact with your local DynamoDB using commands like:
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:1234

# Scan a table
aws dynamodb scan --table-name Ads --endpoint-url http://localhost:1234

# Delete a table
aws dynamodb delete-table --table-name Ads --endpoint-url http://localhost:1234
## Creating DynamoDB Tables

The application automatically creates the necessary DynamoDB tables on startup in development mode if they don't already exist. The `DynamoDbInitializer` class handles this by:

1. Checking if the required tables exist
2. Creating tables with appropriate key schemas if they don't

### Ads Table Schema

The Ads table uses the following schema:
- Table Name: `Ads`
- Primary Key:
  - Hash Key (Partition Key): `Id` (String)
  - Range Key (Sort Key): `ProjectId` (String)
- Provisioned Throughput:
  - Read Capacity Units: 5
  - Write Capacity Units: 5

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - If port 1234 is already in use, you can modify the port in both:
     - The DynamoDB Local startup script
     - The `appsettings.Development.json` file

2. **Java Not Found**
   - Ensure Java is installed and in your PATH
   - Verify with `java -version` in your terminal

3. **Permission Issues**
   - Run PowerShell as Administrator if you encounter permission errors

4. **Connection Refused**
   - Check if DynamoDB Local is actually running
   - Verify the port number matches in both the script and application settings

### Logs

If you encounter issues, check the application logs for DynamoDB-related messages. The application prints helpful information about:
- DynamoDB Local connection status
- Table creation results
- Any errors that occur during initialization