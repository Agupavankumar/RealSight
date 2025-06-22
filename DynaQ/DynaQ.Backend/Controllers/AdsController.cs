using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Services;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdsController : ControllerBase
    {
        private readonly IAdService _adService;

        public AdsController(IAdService adService)
        {
            _adService = adService;
        }

        [HttpGet("{adId}")]
        public async Task<IActionResult> GetAdMetadata(string adId, [FromQuery] string projectId)
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
                var adMetadata = await _adService.GetAdMetadataAsync(adId, projectId);
                
                if (adMetadata == null)
                {
                    return NotFound(new { error = "Ad not found or not accessible for this project" });
                }

                return Ok(adMetadata);
            }
            catch
            {
                // Log the exception in a real application
                return StatusCode(500, new { error = "An error occurred while retrieving the ad metadata" });
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetAdsByProject(string projectId)
        {
            if (string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Project ID is required" });
            }

            try
            {
                var ads = await _adService.GetAdsByProjectAsync(projectId);
                return Ok(ads);
            }
            catch
            {
                // Log the exception in a real application
                return StatusCode(500, new { error = "An error occurred while retrieving ads for the project" });
            }
        }
    }
} 