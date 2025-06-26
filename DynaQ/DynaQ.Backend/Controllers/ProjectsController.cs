using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Models;
using DynaQ.Backend.Services;

namespace DynaQ.Backend.Controllers
{
    /// <summary>
    /// Controller for managing projects
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(IProjectService projectService, ILogger<ProjectsController> logger)
        {
            _projectService = projectService;
            _logger = logger;
        }

        /// <summary>
        /// Gets all projects
        /// </summary>
        /// <returns>A list of all projects</returns>
        /// <response code="200">Returns the list of projects</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProjectSummary>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ProjectSummary>>> GetAllProjects()
        {
            try
            {
                var projects = await _projectService.GetAllProjectsAsync();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all projects");
                return StatusCode(500, new { error = "An error occurred while retrieving projects" });
            }
        }

        /// <summary>
        /// Gets a specific project by ID
        /// </summary>
        /// <param name="projectId">The ID of the project to retrieve</param>
        /// <returns>The project if found</returns>
        /// <response code="200">Returns the project</response>
        /// <response code="404">If the project doesn't exist</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{projectId}")]
        [ProducesResponseType(typeof(Project), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Project>> GetProject(string projectId)
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(projectId);
                
                if (project == null)
                {
                    return NotFound(new { error = $"Project with ID '{projectId}' not found" });
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project {ProjectId}", projectId);
                return StatusCode(500, new { error = "An error occurred while retrieving the project" });
            }
        }

        /// <summary>
        /// Creates a new project
        /// </summary>
        /// <param name="request">The project data to create</param>
        /// <returns>The newly created project</returns>
        /// <response code="201">Returns the newly created project</response>
        /// <response code="400">If the request data is invalid</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost]
        [ProducesResponseType(typeof(Project), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var project = await _projectService.CreateProjectAsync(request);
                return CreatedAtAction(nameof(GetProject), new { projectId = project.Id }, project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, new { error = "An error occurred while creating the project" });
            }
        }

        /// <summary>
        /// Updates an existing project
        /// </summary>
        /// <param name="projectId">The ID of the project to update</param>
        /// <param name="request">The updated project data</param>
        /// <returns>The updated project</returns>
        /// <response code="200">Returns the updated project</response>
        /// <response code="400">If the request data is invalid</response>
        /// <response code="404">If the project doesn't exist</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPut("{projectId}")]
        [ProducesResponseType(typeof(Project), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Project>> UpdateProject(string projectId, [FromBody] UpdateProjectRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var project = await _projectService.UpdateProjectAsync(projectId, request);
                
                if (project == null)
                {
                    return NotFound(new { error = $"Project with ID '{projectId}' not found" });
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {ProjectId}", projectId);
                return StatusCode(500, new { error = "An error occurred while updating the project" });
            }
        }

        /// <summary>
        /// Deletes a project
        /// </summary>
        /// <param name="projectId">The ID of the project to delete</param>
        /// <returns>No content if successful</returns>
        /// <response code="204">If the project was successfully deleted</response>
        /// <response code="404">If the project doesn't exist</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpDelete("{projectId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteProject(string projectId)
        {
            try
            {
                var deleted = await _projectService.DeleteProjectAsync(projectId);
                
                if (!deleted)
                {
                    return NotFound(new { error = $"Project with ID '{projectId}' not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project {ProjectId}", projectId);
                return StatusCode(500, new { error = "An error occurred while deleting the project" });
            }
        }
    }
}