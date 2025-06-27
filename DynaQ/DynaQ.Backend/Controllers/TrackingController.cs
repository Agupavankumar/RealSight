using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Services;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrackingController : ControllerBase
    {
        private readonly ITrackingService _trackingService;
        private readonly ILogger<TrackingController> _logger;

        public TrackingController(ITrackingService trackingService, ILogger<TrackingController> logger)
        {
            _trackingService = trackingService;
            _logger = logger;
        }

        [HttpPost("events")]
        public async Task<IActionResult> TrackEvent([FromBody] TrackingEventRequest eventData)
        {
            if (eventData == null)
            {
                return BadRequest(new { error = "Event data is required" });
            }

            try
            {
                var response = await _trackingService.TrackEventAsync(eventData);
                
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking event");
                return StatusCode(500, new { error = "An error occurred while tracking the event" });
            }
        }

        [HttpGet("events/{eventId}")]
        public async Task<IActionResult> GetEvent(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
            {
                return BadRequest(new { error = "Event ID is required" });
            }

            try
            {
                var trackingEvent = await _trackingService.GetEventByIdAsync(eventId);
                
                if (trackingEvent == null)
                {
                    return NotFound(new { error = "Event not found" });
                }
                
                return Ok(trackingEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event {EventId}", eventId);
                return StatusCode(500, new { error = "An error occurred while retrieving the event" });
            }
        }

        [HttpGet("events/project/{projectId}")]
        public async Task<IActionResult> GetEventsByProject(
            string projectId, 
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            if (string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Project ID is required" });
            }

            try
            {
                var events = await _trackingService.GetEventsByProjectAsync(projectId, fromDate, toDate);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events for project {ProjectId}", projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving events" });
            }
        }

        [HttpGet("events/ad/{adId}")]
        public async Task<IActionResult> GetEventsByAd(string adId, [FromQuery] string projectId)
        {
            if (string.IsNullOrEmpty(adId))
            {
                return BadRequest(new { error = "Ad ID is required" });
            }

            if (string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Project ID is required" });
            }

            try
            {
                var events = await _trackingService.GetEventsByAdAsync(adId, projectId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events for ad {AdId} in project {ProjectId}", adId, projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving ad events" });
            }
        }

        [HttpGet("events/survey/{surveyId}")]
        public async Task<IActionResult> GetEventsBySurvey(string surveyId, [FromQuery] string projectId)
        {
            if (string.IsNullOrEmpty(surveyId))
            {
                return BadRequest(new { error = "Survey ID is required" });
            }

            if (string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Project ID is required" });
            }

            try
            {
                var events = await _trackingService.GetEventsBySurveyAsync(surveyId, projectId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events for survey {SurveyId} in project {ProjectId}", surveyId, projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving survey events" });
            }
        }

        [HttpDelete("events/{eventId}")]
        public async Task<IActionResult> DeleteEvent(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
            {
                return BadRequest(new { error = "Event ID is required" });
            }

            try
            {
                var deleted = await _trackingService.DeleteEventAsync(eventId);
                
                if (!deleted)
                {
                    return NotFound(new { error = "Event not found" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId}", eventId);
                return StatusCode(500, new { error = "An error occurred while deleting the event" });
            }
        }
    }
}