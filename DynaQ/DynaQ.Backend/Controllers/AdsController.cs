using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Services;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Controllers
{
    /// <summary>
    /// Controller for managing advertisements
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AdsController : ControllerBase
    {
        private readonly IAdService _adService;
        private readonly ILogger<AdsController> _logger;

        public AdsController(IAdService adService, ILogger<AdsController> logger)
        {
            _adService = adService;
            _logger = logger;
        }

        /// <summary>
        /// Gets a specific ad by ID
        /// </summary>
        /// <param name="adId">The ID of the ad to retrieve</param>
        /// <param name="projectId">The project ID the ad belongs to</param>
        /// <returns>The ad metadata if found</returns>
        /// <response code="200">Returns the ad metadata</response>
        /// <response code="400">If the adId or projectId is missing</response>
        /// <response code="404">If the ad doesn't exist or isn't accessible</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{adId}")]
        [ProducesResponseType(typeof(AdMetadata), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving ad {AdId} for project {ProjectId}", adId, projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving the ad metadata" });
            }
        }

        /// <summary>
        /// Gets all ads for a specific project
        /// </summary>
        /// <param name="projectId">The project ID to get ads for</param>
        /// <returns>A list of ads for the specified project</returns>
        /// <response code="200">Returns the list of ads</response>
        /// <response code="400">If the projectId is missing</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("project/{projectId}")]
        [ProducesResponseType(typeof(IEnumerable<AdMetadata>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving ads for project {ProjectId}", projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving ads for the project" });
            }
        }

        /// <summary>
        /// Creates a new ad
        /// </summary>
        /// <param name="ad">The ad data to create</param>
        /// <returns>The newly created ad</returns>
        /// <response code="201">Returns the newly created ad</response>
        /// <response code="400">If the ad data is invalid</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost]
        [ProducesResponseType(typeof(Ad), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateAd([FromBody] Ad ad)
        {
            if (ad == null)
            {
                return BadRequest(new { error = "Ad data is required" });
            }

            try
            {
                var created = await _adService.CreateAdAsync(ad);
                return CreatedAtAction(nameof(GetAdMetadata), 
                    new { adId = created.Id, projectId = created.ProjectId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ad for project {ProjectId}", ad.ProjectId);
                return StatusCode(500, new { error = "An error occurred while creating the ad" });
            }
        }

        /// <summary>
        /// Updates an existing ad
        /// </summary>
        /// <param name="adId">The ID of the ad to update</param>
        /// <param name="projectId">The project ID the ad belongs to</param>
        /// <param name="ad">The updated ad data</param>
        /// <returns>The updated ad</returns>
        /// <response code="200">Returns the updated ad</response>
        /// <response code="400">If the adId, projectId or ad data is invalid</response>
        /// <response code="404">If the ad doesn't exist</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPut("{adId}")]
        [ProducesResponseType(typeof(Ad), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateAd(string adId, [FromQuery] string projectId, [FromBody] Ad ad)
        {
            if (string.IsNullOrEmpty(adId) || string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Ad ID and Project ID are required" });
            }

            try
            {
                var updated = await _adService.UpdateAdAsync(adId, projectId, ad);
                if (updated == null)
                {
                    return NotFound(new { error = "Ad not found" });
                }
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ad {AdId} for project {ProjectId}", adId, projectId);
                return StatusCode(500, new { error = "An error occurred while updating the ad" });
            }
        }

        /// <summary>
        /// Deletes an ad
        /// </summary>
        /// <param name="adId">The ID of the ad to delete</param>
        /// <param name="projectId">The project ID the ad belongs to</param>
        /// <returns>No content if successful</returns>
        /// <response code="204">If the ad was successfully deleted</response>
        /// <response code="400">If the adId or projectId is missing</response>
        /// <response code="404">If the ad doesn't exist</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpDelete("{adId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteAd(string adId, [FromQuery] string projectId)
        {
            if (string.IsNullOrEmpty(adId) || string.IsNullOrEmpty(projectId))
            {
                return BadRequest(new { error = "Ad ID and Project ID are required" });
            }

            try
            {
                var deleted = await _adService.DeleteAdAsync(adId, projectId);
                if (!deleted)
                {
                    return NotFound(new { error = "Ad not found" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ad {AdId} for project {ProjectId}", adId, projectId);
                return StatusCode(500, new { error = "An error occurred while deleting the ad" });
            }
        }
    }
}