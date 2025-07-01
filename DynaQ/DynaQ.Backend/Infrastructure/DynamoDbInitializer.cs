using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;

namespace DynaQ.Backend.Infrastructure
{
    public static class DynamoDbInitializer
    {
        public static async Task EnsureTablesExistAsync(IAmazonDynamoDB dynamoDb)
        {
            // Get existing tables
            var existingTables = await dynamoDb.ListTablesAsync();
            
            // Check and create Ads table if it doesn't exist
            if (!existingTables.TableNames.Contains("Ads"))
            {
                await CreateAdsTableAsync(dynamoDb);
            }
            
            // Check and create Projects table if it doesn't exist
            if (!existingTables.TableNames.Contains("Projects"))
            {
                await CreateProjectsTableAsync(dynamoDb);
            }
            
            // Check and create Surveys table if it doesn't exist
            if (!existingTables.TableNames.Contains("Surveys"))
            {
                await CreateSurveysTableAsync(dynamoDb);
            }
            
            // Check and create SurveyResponses table if it doesn't exist
            if (!existingTables.TableNames.Contains("SurveyResponses"))
            {
                await CreateSurveyResponsesTableAsync(dynamoDb);
            }
            
            // Check and create TrackingEvents table if it doesn't exist
            if (!existingTables.TableNames.Contains("TrackingEvents"))
            {
                await CreateTrackingEventsTableAsync(dynamoDb);
            }
            
            // Check and create Instructions table if it doesn't exist
            if (!existingTables.TableNames.Contains("Instructions"))
            {
                await CreateInstructionsTableAsync(dynamoDb);
            }
        }
        
        private static async Task CreateAdsTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "Ads",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "ProjectId",
                        AttributeType = "S" // String type
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    },
                    new KeySchemaElement
                    {
                        AttributeName = "ProjectId",
                        KeyType = "RANGE" // Sort key
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating Ads table: {ex.Message}");
                throw;
            }
        }
        
        private static async Task CreateProjectsTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "Projects",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating Projects table: {ex.Message}");
                throw;
            }
        }
        
        private static async Task CreateSurveysTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "Surveys",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "ProjectId",
                        AttributeType = "S" // String type
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    },
                    new KeySchemaElement
                    {
                        AttributeName = "ProjectId",
                        KeyType = "RANGE" // Sort key
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating Surveys table: {ex.Message}");
                throw;
            }
        }
        
        private static async Task CreateSurveyResponsesTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "SurveyResponses",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "SurveyId",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "ProjectId",
                        AttributeType = "S" // String type
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    },
                    new KeySchemaElement
                    {
                        AttributeName = "SurveyId",
                        KeyType = "RANGE" // Sort key
                    }
                },
                GlobalSecondaryIndexes = new List<GlobalSecondaryIndex>
                {
                    new GlobalSecondaryIndex
                    {
                        IndexName = "ProjectId-SurveyId-index",
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement
                            {
                                AttributeName = "ProjectId",
                                KeyType = "HASH"
                            },
                            new KeySchemaElement
                            {
                                AttributeName = "SurveyId",
                                KeyType = "RANGE"
                            }
                        },
                        Projection = new Projection
                        {
                            ProjectionType = ProjectionType.ALL
                        },
                        ProvisionedThroughput = new ProvisionedThroughput
                        {
                            ReadCapacityUnits = 5,
                            WriteCapacityUnits = 5
                        }
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating SurveyResponses table: {ex.Message}");
                throw;
            }
        }
        
        private static async Task CreateTrackingEventsTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "TrackingEvents",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "ProjectId",
                        AttributeType = "S" // String type
                    },
                    new AttributeDefinition
                    {
                        AttributeName = "Timestamp",
                        AttributeType = "S" // String type for date (ISO format)
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    }
                },
                GlobalSecondaryIndexes = new List<GlobalSecondaryIndex>
                {
                    new GlobalSecondaryIndex
                    {
                        IndexName = "ProjectId-Timestamp-index",
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement
                            {
                                AttributeName = "ProjectId",
                                KeyType = "HASH"
                            },
                            new KeySchemaElement
                            {
                                AttributeName = "Timestamp",
                                KeyType = "RANGE"
                            }
                        },
                        Projection = new Projection
                        {
                            ProjectionType = ProjectionType.ALL
                        },
                        ProvisionedThroughput = new ProvisionedThroughput
                        {
                            ReadCapacityUnits = 5,
                            WriteCapacityUnits = 5
                        }
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating TrackingEvents table: {ex.Message}");
                throw;
            }
        }
        
        private static async Task CreateInstructionsTableAsync(IAmazonDynamoDB dynamoDb)
        {
            var request = new CreateTableRequest
            {
                TableName = "Instructions",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = "S" // String type
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = "HASH" // Partition key
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };
            
            try
            {
                var response = await dynamoDb.CreateTableAsync(request);
                Console.WriteLine($"Created table {response.TableDescription.TableName}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating Instructions table: {ex.Message}");
                throw;
            }
        }
    }
}