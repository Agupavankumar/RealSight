# API Documentation with Swagger UI

This project uses Swagger UI to provide interactive API documentation. Swagger UI allows you to visualize and interact with the API's resources without having any implementation logic in place.

## Accessing Swagger UI

When running the application in development mode, Swagger UI is automatically available at the root URL:
http://localhost:<port>/
Replace `<port>` with the port your application is running on (usually 5000, 5001, or another port specified in your launch settings).

## Features

The Swagger UI provides:

1. **Interactive Documentation**: Test API endpoints directly from your browser
2. **Request Builder**: Construct API requests with a user-friendly interface
3. **Response Visualization**: See response data and status codes
4. **Model Schemas**: View the structure of request and response objects

## Authentication

The API currently does not require authentication for local development. In a production environment, appropriate authentication mechanisms would be implemented.

## Available Endpoints

The following endpoint groups are available:

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{projectId}` - Get a specific project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/{projectId}` - Update an existing project
- `DELETE /api/projects/{projectId}` - Delete a project

### Ads
- `GET /api/ads/{adId}` - Get a specific ad by ID
- `GET /api/ads/project/{projectId}` - Get all ads for a project
- `POST /api/ads` - Create a new ad
- `PUT /api/ads/{adId}` - Update an existing ad
- `DELETE /api/ads/{adId}` - Delete an ad

### Surveys
- `GET /api/survey/{surveyId}` - Get a specific survey
- `GET /api/survey/project/{projectId}` - Get all surveys for a project
- `POST /api/survey` - Create a new survey
- `DELETE /api/survey/{surveyId}` - Delete a survey

### Tracking
- `POST /api/tracking/events` - Track an event
- `GET /api/tracking/events/{eventId}` - Get a specific event by ID
- `GET /api/tracking/events/project/{projectId}` - Get events for a project
- `GET /api/tracking/events/ad/{adId}` - Get events for a specific ad
- `GET /api/tracking/events/survey/{surveyId}` - Get events for a specific survey
- `DELETE /api/tracking/events/{eventId}` - Delete an event

## Using Swagger UI

1. Navigate to the Swagger UI URL (root of the application in development)
2. Expand an endpoint by clicking on it
3. Click the "Try it out" button
4. Fill in any required parameters or request body
5. Click "Execute" to send the request
6. View the response

## Testing DynamoDB Integration

When testing with DynamoDB Local:

1. Make sure DynamoDB Local is running on port 1234 (see [DynamoDB Local Setup](./dynamodb-local-setup.md))
2. Use the Swagger UI to create, read, update, and delete data
3. Verify the operations in the DynamoDB Local database using the AWS CLI or other tools

## Example Requests

### Creating a new project:
{
  "name": "Marketing Campaign 2023",
  "description": "Summer promotional campaign for new product line"
}
### Creating a new ad:
{
  "id": "ad-005",
  "projectId": "project-001",
  "title": "Summer Sale",
  "content": "Save up to 50% on selected items",
  "brandName": "ExampleStore",
  "imageUrl": "https://example.com/images/summer-sale.jpg",
  "clickUrl": "https://example.com/summer-sale",
  "isActive": true
}
### Updating an existing ad:
{
  "id": "ad-005",
  "projectId": "project-001",
  "title": "Extended Summer Sale",
  "content": "Save up to 70% on selected items",
  "brandName": "ExampleStore",
  "imageUrl": "https://example.com/images/summer-sale-extended.jpg",
  "clickUrl": "https://example.com/summer-sale-extended",
  "isActive": true
}
### Tracking an event:
{
  "eventType": "ad_click",
  "eventId": "click-123",
  "projectId": "project-001",
  "adId": "ad-005",
  "sessionId": "sess-456"
}
## Response Examples

### Successful Project Retrieval:
{
  "id": "project-001",
  "name": "Marketing Campaign 2023",
  "description": "Summer promotional campaign for new product line",
  "isActive": true,
  "createdAt": "2023-05-15T10:30:00Z",
  "updatedAt": "2023-05-15T10:30:00Z"
}
### Successful Ad Retrieval:
{
  "id": "ad-005",
  "projectId": "project-001",
  "title": "Summer Sale",
  "content": "Save up to 50% on selected items",
  "brandName": "ExampleStore",
  "imageUrl": "https://example.com/images/summer-sale.jpg",
  "clickUrl": "https://example.com/summer-sale",
  "isActive": true
}
### Successful Event Retrieval:
{
  "id": "evt-789",
  "eventType": "ad_click",
  "eventId": "click-123",
  "projectId": "project-001",
  "adId": "ad-005",
  "timestamp": "2023-05-15T14:30:00Z",
  "sessionId": "sess-456"
}
### Error Response:
{
  "error": "Project not found"
}
## Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned (e.g., after deletion)
- **400 Bad Request**: Invalid parameters or request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

## Further Documentation

For more details on:
- Setting up DynamoDB Local, see [DynamoDB Local Setup](./dynamodb-local-setup.md)
- Swagger implementation details, see [Swagger Implementation](./swagger-implementation.md)