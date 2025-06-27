using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class SurveyService : ISurveyService
    {
        private readonly IDynamoDBContext _dbContext;

        public SurveyService(IDynamoDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Survey?> GetSurveyAsync(string surveyId, string projectId)
        {
            var survey = await _dbContext.LoadAsync<Survey>(surveyId, projectId);
            if (survey == null || !survey.IsActive) 
                return null;
            return survey;
        }

        public async Task<List<Survey>> GetSurveysByProjectAsync(string projectId)
        {
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("ProjectId", ScanOperator.Equal, projectId),
                new ScanCondition("IsActive", ScanOperator.Equal, true)
            };
            
            var surveys = await _dbContext.ScanAsync<Survey>(conditions).GetRemainingAsync();
            return surveys.OrderByDescending(s => s.CreatedAt).ToList();
        }

        public async Task<Survey> CreateSurveyAsync(CreateSurveyRequest request)
        {
            var survey = new Survey
            {
                Title = request.Title,
                Description = request.Description,
                ProjectId = request.ProjectId,
                Questions = request.Questions.Select((q, index) => new SurveyQuestion
                {
                    Question = q.Question,
                    Type = q.Type,
                    Required = q.Required,
                    Options = q.Options,
                    MaxRating = q.MaxRating,
                    Order = q.Order > 0 ? q.Order : index + 1
                }).ToList(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _dbContext.SaveAsync(survey);
            return survey;
        }

        public async Task<SurveyResponse> SubmitSurveyResponseAsync(SubmitSurveyResponseRequest request)
        {
            // Validate that the survey exists
            var survey = await GetSurveyAsync(request.SurveyId, request.ProjectId);
            if (survey == null)
            {
                throw new InvalidOperationException("Survey not found or does not belong to the specified project.");
            }

            // Create and save the response
            var response = new SurveyResponse
            {
                SurveyId = request.SurveyId,
                ProjectId = request.ProjectId,
                Responses = request.Responses,
                SubmittedAt = DateTime.UtcNow,
                SessionId = request.SessionId
            };

            await _dbContext.SaveAsync(response);
            return response;
        }

        public async Task<List<SurveyResponse>> GetSurveyResponsesAsync(string surveyId, string projectId)
        {
            // First, verify that the survey exists
            var survey = await GetSurveyAsync(surveyId, projectId);
            if (survey == null)
            {
                return new List<SurveyResponse>();
            }

            // Query using the GSI
            var queryConfig = new DynamoDBOperationConfig
            {
                IndexName = "ProjectId-SurveyId-index"
            };

            var responses = await _dbContext.QueryAsync<SurveyResponse>(projectId, QueryOperator.Equal, new[] { surveyId }, queryConfig).GetRemainingAsync();
            return responses.OrderByDescending(r => r.SubmittedAt).ToList();
        }

        public async Task<bool> DeleteSurveyAsync(string surveyId, string projectId)
        {
            var survey = await _dbContext.LoadAsync<Survey>(surveyId, projectId);
            if (survey == null) 
                return false;
            
            // Soft delete - just mark as inactive
            survey.IsActive = false;
            survey.UpdatedAt = DateTime.UtcNow;
            
            await _dbContext.SaveAsync(survey);
            return true;
        }
    }
}