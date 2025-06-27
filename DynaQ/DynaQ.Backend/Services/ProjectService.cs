using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IDynamoDBContext _dbContext;

        public ProjectService(IDynamoDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<ProjectSummary>> GetAllProjectsAsync()
        {
            var scan = _dbContext.ScanAsync<Project>(new List<ScanCondition>());
            var projects = await scan.GetRemainingAsync();
            
            return projects.Select(p => new ProjectSummary
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            });
        }

        public async Task<Project?> GetProjectByIdAsync(string projectId)
        {
            var project = await _dbContext.LoadAsync<Project>(projectId);
            
            // Return null if project doesn't exist or is inactive (soft deleted)
            if (project == null || !project.IsActive) 
                return null;
                
            return project;
        }

        public async Task<Project> CreateProjectAsync(CreateProjectRequest request)
        {
            var project = new Project
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            await _dbContext.SaveAsync(project);
            return project;
        }

        public async Task<Project?> UpdateProjectAsync(string projectId, UpdateProjectRequest request)
        {
            var project = await _dbContext.LoadAsync<Project>(projectId);
            
            if (project == null || !project.IsActive)
                return null;
                
            project.Name = request.Name;
            project.Description = request.Description;
            project.IsActive = request.IsActive;
            project.UpdatedAt = DateTime.UtcNow;
            
            await _dbContext.SaveAsync(project);
            return project;
        }

        public async Task<bool> DeleteProjectAsync(string projectId)
        {
            // Option 1: Hard delete - completely remove from database
            // await _dbContext.DeleteAsync<Project>(projectId);
            
            // Option 2: Soft delete - mark as inactive but keep in database
            var project = await _dbContext.LoadAsync<Project>(projectId);
            
            if (project == null || !project.IsActive)
                return false;
                
            project.IsActive = false;
            project.UpdatedAt = DateTime.UtcNow;
            
            await _dbContext.SaveAsync(project);
            return true;
        }
    }
}