using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface ISurveyService
    {
        Task<Survey?> GetSurveyAsync(string surveyId, string projectId);
        Task<List<Survey>> GetSurveysByProjectAsync(string projectId);
        Task<Survey> CreateSurveyAsync(CreateSurveyRequest request);
        Task<SurveyResponse> SubmitSurveyResponseAsync(SubmitSurveyResponseRequest request);
        Task<List<SurveyResponse>> GetSurveyResponsesAsync(string surveyId, string projectId);
        Task<bool> DeleteSurveyAsync(string surveyId, string projectId);
    }
} 