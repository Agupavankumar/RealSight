using Amazon.DynamoDBv2.DataModel;

namespace DynaQ.Backend.Models
{
    [DynamoDBTable("TrackingEvents")]
    public class TrackingEvent
    {
        [DynamoDBHashKey]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [DynamoDBGlobalSecondaryIndexHashKey("ProjectId-Timestamp-index")]
        public string ProjectId { get; set; } = string.Empty;
        
        public string EventType { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string? AdId { get; set; }
        public string? SurveyId { get; set; }
        
        [DynamoDBGlobalSecondaryIndexRangeKey("ProjectId-Timestamp-index")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
        public string? SessionId { get; set; }
    }

    public class TrackingEventRequest
    {
        public string EventType { get; set; } = string.Empty;
        public string EventId { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string? AdId { get; set; }
        public string? SurveyId { get; set; }
        public string? SessionId { get; set; }
    }

    public class TrackingEventResponse
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
        public string EventId { get; set; } = string.Empty;
    }
}