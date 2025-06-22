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

        public TrackingController(ITrackingService trackingService)
        {
            _trackingService = trackingService;
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
            catch
            {
                return StatusCode(500, new { error = "An error occurred while tracking the event" });
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
            catch
            {
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
            catch
            {
                return StatusCode(500, new { error = "An error occurred while retrieving ad events" });
            }
        }
    }
} 