# Swagger/OpenAPI Implementation

This document provides an overview of the Swagger/OpenAPI implementation in the DynaQ.Backend project.

## What's Been Added

1. **Swagger UI Integration**
   - Added the Swashbuckle.AspNetCore package
   - Configured Swagger UI to appear at the root URL in development mode
   - Set up detailed API documentation including response types and examples

2. **XML Documentation**
   - Enabled XML documentation file generation in the project
   - Added comprehensive XML comments to controllers and action methods
   - Configured Swagger to use these comments in the UI

3. **Response Type Documentation**
   - Added ProducesResponseType attributes to all controller actions
   - Documented the different HTTP status codes each endpoint can return
   - Linked response types to model classes for better schema documentation

4. **API Documentation Guide**
   - Created a documentation file explaining how to use the API with Swagger UI
   - Included examples and instructions for testing different endpoints

## How to Use Swagger UI

1. **Start the Application in Development Mode**dotnet run --environment Development
2. **Access Swagger UI**
   Open your browser and navigate to the root URL of your application:http://localhost:<port>/   where `<port>` is the port your application is running on.

3. **Explore and Test the API**
   - Use the Swagger UI to view all available endpoints
   - Expand an endpoint to see details and documentation
   - Use the "Try it out" button to execute requests
   - See live responses and status codes

## Testing with DynamoDB Local

When using Swagger UI with DynamoDB Local:

1. Start DynamoDB Local on port 1212:.\scripts\start-dynamodb-local.ps1
2. Start the application in development mode:dotnet run --environment Development
3. Use Swagger UI to:
   - Create new ads
   - Retrieve ads by ID or project
   - Update existing ads
   - Delete ads

4. Verify operations in DynamoDB Local using AWS CLI:aws dynamodb scan --table-name Ads --endpoint-url http://localhost:1212
## API Model Information

The DynaQ API has the following key models:

### Ad Model
- Primary key structure: 
  - `Id` (Hash Key) - Unique identifier for the ad
  - `ProjectId` (Range Key) - Project identifier that the ad belongs to
- Properties:
  - `Title` - Ad title
  - `Content` - Ad content
  - `BrandName` - Brand associated with the ad
  - `ImageUrl` - URL to the ad image
  - `ClickUrl` - Destination URL when ad is clicked
  - `IsActive` - Whether the ad is active
  - `CreatedAt` - Creation timestamp
  - `UpdatedAt` - Last update timestamp

### Example JSON for Creating an Ad{
  "id": "ad-005",
  "projectId": "project-001",
  "title": "Summer Sale",
  "content": "Save up to 50% on selected items",
  "brandName": "ExampleStore",
  "imageUrl": "https://example.com/images/summer-sale.jpg",
  "clickUrl": "https://example.com/summer-sale",
  "isActive": true
}
## Common Issues and Solutions

### DynamoDB Connection Issues
If you see errors connecting to DynamoDB Local:
1. Verify DynamoDB Local is running on port 1212
2. Check the `appsettings.Development.json` configuration
3. Make sure the port matches (1212) in both the DynamoDB script and application settings

### Incorrect JSON Format
When creating or updating an ad, ensure:
1. Use `id` (not `adId`) as the property name
2. Include required fields: `id`, `projectId`, `title`, `content`, and `brandName`
3. Boolean values are lowercase (`true`/`false`)

## Additional Notes

- The Swagger UI is only enabled in the Development environment
- XML comments are used to enhance the API documentation
- Model schemas are automatically generated from your C# classes
- Detailed API documentation is available in the docs/api-documentation.md file