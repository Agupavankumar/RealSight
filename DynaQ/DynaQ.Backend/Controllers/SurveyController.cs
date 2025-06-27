using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Models;
using DynaQ.Backend.Services;

namespace DynaQ.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SurveyController : ControllerBase
    {
        private readonly ISurveyService _surveyService;
        private readonly ILogger<SurveyController> _logger;

        public SurveyController(ISurveyService surveyService, ILogger<SurveyController> logger)
        {
            _surveyService = surveyService;
            _logger = logger;
        }

        /// <summary>
        /// Get survey configuration by ID and project
        /// </summary>
        [HttpGet("{surveyId}")]
        public async Task<ActionResult<Survey>> GetSurvey(string surveyId, [FromQuery] string projectId)
        {
            try
            {
                if (string.IsNullOrEmpty(projectId))
                {
                    return BadRequest("Project ID is required");
                }

                var survey = await _surveyService.GetSurveyAsync(surveyId, projectId);
                
                if (survey == null)
                {
                    return NotFound($"Survey with ID '{surveyId}' not found for project '{projectId}'");
                }

                return Ok(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving survey {SurveyId} for project {ProjectId}", surveyId, projectId);
                return StatusCode(500, "An error occurred while retrieving the survey");
            }
        }

        /// <summary>
        /// Get all surveys for a project
        /// </summary>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<List<Survey>>> GetSurveysByProject(string projectId)
        {
            try
            {
                var surveys = await _surveyService.GetSurveysByProjectAsync(projectId);
                return Ok(surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving surveys for project {ProjectId}", projectId);
                return StatusCode(500, "An error occurred while retrieving surveys");
            }
        }

        /// <summary>
        /// Create a new survey
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Survey>> CreateSurvey([FromBody] CreateSurveyRequest request)
        { 
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var survey = await _surveyService.CreateSurveyAsync(request);
                return CreatedAtAction(nameof(GetSurvey), new { surveyId = survey.Id, projectId = survey.ProjectId }, survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey for project {ProjectId}", request.ProjectId);
                return StatusCode(500, "An error occurred while creating the survey");
            }
        }

        /// <summary>
        /// Submit survey responses
        /// </summary>
        [HttpPost("responses")]
        public async Task<ActionResult<SurveyResponse>> SubmitSurveyResponse([FromBody] SubmitSurveyResponseRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _surveyService.SubmitSurveyResponseAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid survey response submission for survey {SurveyId}", request.SurveyId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting survey response for survey {SurveyId}", request.SurveyId);
                return StatusCode(500, "An error occurred while submitting the survey response");
            }
        }

        /// <summary>
        /// Get survey responses for a specific survey
        /// </summary>
        [HttpGet("{surveyId}/responses")]
        public async Task<ActionResult<List<SurveyResponse>>> GetSurveyResponses(string surveyId, [FromQuery] string projectId)
        {
            try
            {
                if (string.IsNullOrEmpty(projectId))
                {
                    return BadRequest("Project ID is required");
                }

                var responses = await _surveyService.GetSurveyResponsesAsync(surveyId, projectId);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving responses for survey {SurveyId}", surveyId);
                return StatusCode(500, "An error occurred while retrieving survey responses");
            }
        }

        /// <summary>
        /// Delete a survey (soft delete)
        /// </summary>
        [HttpDelete("{surveyId}")]
        public async Task<ActionResult> DeleteSurvey(string surveyId, [FromQuery] string projectId)
        {
            try
            {
                if (string.IsNullOrEmpty(projectId))
                {
                    return BadRequest("Project ID is required");
                }

                var deleted = await _surveyService.DeleteSurveyAsync(surveyId, projectId);
                
                if (!deleted)
                {
                    return NotFound($"Survey with ID '{surveyId}' not found for project '{projectId}'");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey {SurveyId} for project {ProjectId}", surveyId, projectId);
                return StatusCode(500, "An error occurred while deleting the survey");
            }
        }
    }
} 