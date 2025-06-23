using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class SurveyService : ISurveyService
    {
        private readonly List<Survey> _surveys = new();
        private readonly List<SurveyResponse> _responses = new();

        public SurveyService()
        {
            // Initialize with mock data
            InitializeMockData();
        }

        private void InitializeMockData()
        {
            var mockSurvey = new Survey
            {
                Id = "survey-001",
                Title = "Customer Satisfaction Survey",
                Description = "Help us improve our services by providing your feedback.",
                ProjectId = "project-001",
                Questions = new List<SurveyQuestion>
                {
                    new SurveyQuestion
                    {
                        Id = "q1",
                        Question = "How satisfied are you with our service?",
                        Type = QuestionType.Rating,
                        Required = true,
                        MaxRating = 5,
                        Order = 1
                    },
                    new SurveyQuestion
                    {
                        Id = "q2",
                        Question = "What is your primary reason for using our service?",
                        Type = QuestionType.MultipleChoice,
                        Required = true,
                        Options = new List<string> { "Work", "Personal", "Education", "Other" },
                        Order = 2
                    },
                    new SurveyQuestion
                    {
                        Id = "q3",
                        Question = "Would you recommend our service to others?",
                        Type = QuestionType.Boolean,
                        Required = true,
                        Order = 3
                    },
                    new SurveyQuestion
                    {
                        Id = "q4",
                        Question = "Please share any additional comments or suggestions:",
                        Type = QuestionType.Text,
                        Required = false,
                        Order = 4
                    }
                },
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _surveys.Add(mockSurvey);
        }

        public async Task<Survey?> GetSurveyAsync(string surveyId, string projectId)
        {
            await Task.Delay(100); // Simulate async operation
            
            return _surveys.FirstOrDefault(s => 
                s.Id == surveyId && 
                s.ProjectId == projectId && 
                s.IsActive);
        }

        public async Task<List<Survey>> GetSurveysByProjectAsync(string projectId)
        {
            await Task.Delay(100); // Simulate async operation
            
            return _surveys
                .Where(s => s.ProjectId == projectId && s.IsActive)
                .OrderBy(s => s.CreatedAt)
                .ToList();
        }

        public async Task<Survey> CreateSurveyAsync(CreateSurveyRequest request)
        {
            await Task.Delay(100); // Simulate async operation
            
            var survey = new Survey
            {
                Id = Guid.NewGuid().ToString(),
                Title = request.Title,
                Description = request.Description,
                ProjectId = request.ProjectId,
                Questions = request.Questions.Select((q, index) => new SurveyQuestion
                {
                    Id = Guid.NewGuid().ToString(),
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

            _surveys.Add(survey);
            return survey;
        }

        public async Task<SurveyResponse> SubmitSurveyResponseAsync(SubmitSurveyResponseRequest request)
        {
            await Task.Delay(100); // Simulate async operation
            
            // Validate that the survey exists and belongs to the project
            var survey = await GetSurveyAsync(request.SurveyId, request.ProjectId);
            if (survey == null)
            {
                throw new InvalidOperationException("Survey not found or does not belong to the specified project.");
            }

            var response = new SurveyResponse
            {
                Id = Guid.NewGuid().ToString(),
                SurveyId = request.SurveyId,
                ProjectId = request.ProjectId,
                Responses = request.Responses,
                SubmittedAt = DateTime.UtcNow,
                SessionId = request.SessionId
            };

            _responses.Add(response);
            return response;
        }

        public async Task<List<SurveyResponse>> GetSurveyResponsesAsync(string surveyId, string projectId)
        {
            await Task.Delay(100); // Simulate async operation
            
            return _responses
                .Where(r => r.SurveyId == surveyId && r.ProjectId == projectId)
                .OrderByDescending(r => r.SubmittedAt)
                .ToList();
        }

        public async Task<bool> DeleteSurveyAsync(string surveyId, string projectId)
        {
            await Task.Delay(100); // Simulate async operation
            
            var survey = _surveys.FirstOrDefault(s => 
                s.Id == surveyId && 
                s.ProjectId == projectId);
            
            if (survey != null)
            {
                survey.IsActive = false;
                survey.UpdatedAt = DateTime.UtcNow;
                return true;
            }
            
            return false;
        }
    }
} 