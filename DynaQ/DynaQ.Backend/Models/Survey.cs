using System.ComponentModel.DataAnnotations;

namespace DynaQ.Backend.Models
{
    public class Survey
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ProjectId { get; set; } = string.Empty;
        public List<SurveyQuestion> Questions { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SurveyQuestion
    {
        public string Id { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public bool Required { get; set; } = false;
        public List<string>? Options { get; set; }
        public int? MaxRating { get; set; }
        public int Order { get; set; }
    }

    public enum QuestionType
    {
        Text,
        MultipleChoice,
        Rating,
        Boolean
    }

    public class SurveyResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SurveyId { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public List<QuestionResponse> Responses { get; set; } = new();
        public DateTime SubmittedAt { get; set; }
        public string? SessionId { get; set; }
    }

    public class QuestionResponse
    {
        public string QuestionId { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
    }

    public class CreateSurveyRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public string ProjectId { get; set; } = string.Empty;
        [Required]
        public List<CreateQuestionRequest> Questions { get; set; } = new();
    }

    public class CreateQuestionRequest
    {
        [Required]
        public string Question { get; set; } = string.Empty;
        [Required]
        public QuestionType Type { get; set; }
        public bool Required { get; set; } = false;
        public List<string>? Options { get; set; }
        public int? MaxRating { get; set; }
        public int Order { get; set; }
    }

    public class SubmitSurveyResponseRequest
    {
        [Required]
        public string SurveyId { get; set; } = string.Empty;
        [Required]
        public string ProjectId { get; set; } = string.Empty;
        [Required]
        public List<QuestionResponse> Responses { get; set; } = new();
        public string? SessionId { get; set; }
    }
} 