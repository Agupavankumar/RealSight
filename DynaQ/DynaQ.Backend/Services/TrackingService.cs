using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class TrackingService : ITrackingService
    {
        private readonly IDynamoDBContext _dbContext;

        public TrackingService(IDynamoDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TrackingEventResponse> TrackEventAsync(TrackingEventRequest eventData)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(eventData.EventType))
                {
                    return new TrackingEventResponse
                    {
                        Success = false,
                        Error = "EventType is required"
                    };
                }

                if (string.IsNullOrEmpty(eventData.EventId))
                {
                    return new TrackingEventResponse
                    {
                        Success = false,
                        Error = "EventId is required"
                    };
                }

                if (string.IsNullOrEmpty(eventData.ProjectId))
                {
                    return new TrackingEventResponse
                    {
                        Success = false,
                        Error = "ProjectId is required"
                    };
                }

                // Validate event type
                var validEventTypes = new[] { "ad_impression", "ad_click", "survey_impression", "survey_submit" };
                if (!validEventTypes.Contains(eventData.EventType))
                {
                    return new TrackingEventResponse
                    {
                        Success = false,
                        Error = $"Invalid EventType. Must be one of: {string.Join(", ", validEventTypes)}"
                    };
                }

                // Create tracking event
                var trackingEvent = new TrackingEvent
                {
                    EventType = eventData.EventType,
                    EventId = eventData.EventId,
                    ProjectId = eventData.ProjectId,
                    AdId = eventData.AdId,
                    SurveyId = eventData.SurveyId,
                    SessionId = eventData.SessionId,
                    Timestamp = DateTime.UtcNow
                };

                // Store the event in DynamoDB
                await _dbContext.SaveAsync(trackingEvent);

                // Log the event
                Console.WriteLine($"Tracked Event: {trackingEvent.EventType} for Project: {trackingEvent.ProjectId} at {trackingEvent.Timestamp}");

                return new TrackingEventResponse
                {
                    Success = true,
                    EventId = trackingEvent.Id
                };
            }
            catch (Exception ex)
            {
                return new TrackingEventResponse
                {
                    Success = false,
                    Error = $"An error occurred while tracking the event: {ex.Message}"
                };
            }
        }

        public async Task<IEnumerable<TrackingEvent>> GetEventsByProjectAsync(string projectId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Use the GSI to query events by ProjectId
            var config = new DynamoDBOperationConfig
            {
                IndexName = "ProjectId-Timestamp-index"
            };

            // Create a QueryRequest for the GSI
            var request = new QueryRequest
            {
                TableName = "TrackingEvents", // Assuming this is the table name that matches the DynamoDBTable attribute
                IndexName = "ProjectId-Timestamp-index",
                KeyConditionExpression = "ProjectId = :projectId",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":projectId", new AttributeValue { S = projectId } }
                }
            };

            // Use the recommended QueryAsync overload
            var queryResults = _dbContext.QueryAsync<TrackingEvent>(projectId, config);
            var events = await queryResults.GetRemainingAsync();

            // Apply date filters if provided
            if (fromDate.HasValue)
            {
                events = events.Where(e => e.Timestamp >= fromDate.Value).ToList();
            }

            if (toDate.HasValue)
            {
                events = events.Where(e => e.Timestamp <= toDate.Value).ToList();
            }

            return events.OrderByDescending(e => e.Timestamp);
        }

        public async Task<IEnumerable<TrackingEvent>> GetEventsByAdAsync(string adId, string projectId)
        {
            // Use a scan operation with a condition on AdId and ProjectId
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("AdId", ScanOperator.Equal, adId),
                new ScanCondition("ProjectId", ScanOperator.Equal, projectId)
            };

            var scanResults = _dbContext.ScanAsync<TrackingEvent>(conditions);
            var events = await scanResults.GetRemainingAsync();

            return events.OrderByDescending(e => e.Timestamp);
        }

        public async Task<TrackingEvent?> GetEventByIdAsync(string eventId)
        {
            try
            {
                return await _dbContext.LoadAsync<TrackingEvent>(eventId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> DeleteEventAsync(string eventId)
        {
            try
            {
                var existingEvent = await _dbContext.LoadAsync<TrackingEvent>(eventId);
                if (existingEvent == null)
                    return false;

                await _dbContext.DeleteAsync<TrackingEvent>(eventId);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<TrackingEvent>> GetEventsBySurveyAsync(string surveyId, string projectId)
        {
            // Use a scan operation with a condition on SurveyId and ProjectId
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("SurveyId", ScanOperator.Equal, surveyId),
                new ScanCondition("ProjectId", ScanOperator.Equal, projectId)
            };

            var scanResults = _dbContext.ScanAsync<TrackingEvent>(conditions);
            var events = await scanResults.GetRemainingAsync();

            return events.OrderByDescending(e => e.Timestamp);
        }
    }
}