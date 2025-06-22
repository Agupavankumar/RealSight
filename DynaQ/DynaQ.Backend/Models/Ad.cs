namespace DynaQ.Backend.Models
{
    public class Ad
    {
        public string Id { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ClickUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AdMetadata
    {
        public string Id { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ClickUrl { get; set; }
        public bool IsActive { get; set; }
    }
} 