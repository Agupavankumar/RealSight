using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface ITrackingService
    {
        Task<TrackingEventResponse> TrackEventAsync(TrackingEventRequest eventData);
        Task<IEnumerable<TrackingEvent>> GetEventsByProjectAsync(string projectId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<TrackingEvent>> GetEventsByAdAsync(string adId, string projectId);
    }
} 