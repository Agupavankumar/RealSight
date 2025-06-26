using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectSummary>> GetAllProjectsAsync();
        Task<Project?> GetProjectByIdAsync(string projectId);
        Task<Project> CreateProjectAsync(CreateProjectRequest request);
        Task<Project?> UpdateProjectAsync(string projectId, UpdateProjectRequest request);
        Task<bool> DeleteProjectAsync(string projectId);
    }
}