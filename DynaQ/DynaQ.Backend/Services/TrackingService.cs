using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class TrackingService : ITrackingService
    {
        private readonly List<TrackingEvent> _trackedEvents;

        public TrackingService()
        {
            _trackedEvents = new List<TrackingEvent>();
        }

        public async Task<TrackingEventResponse> TrackEventAsync(TrackingEventRequest eventData)
        {
            // Simulate async operation
            await Task.Delay(50);

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
                    Metadata = eventData.Metadata,
                    SessionId = eventData.SessionId,
                    Timestamp = DateTime.UtcNow
                };

                // Store the event (in a real app, this would go to a database)
                _trackedEvents.Add(trackingEvent);

                // Log the event (in a real app, this might go to a logging service)
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
            // Simulate async operation
            await Task.Delay(100);

            var query = _trackedEvents.Where(e => e.ProjectId == projectId);

            if (fromDate.HasValue)
            {
                query = query.Where(e => e.Timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(e => e.Timestamp <= toDate.Value);
            }

            return query.OrderByDescending(e => e.Timestamp);
        }

        public async Task<IEnumerable<TrackingEvent>> GetEventsByAdAsync(string adId, string projectId)
        {
            // Simulate async operation
            await Task.Delay(100);

            return _trackedEvents
                .Where(e => e.AdId == adId && e.ProjectId == projectId)
                .OrderByDescending(e => e.Timestamp);
        }
    }
} 