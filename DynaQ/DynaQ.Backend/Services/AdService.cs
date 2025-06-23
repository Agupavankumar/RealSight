using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class AdService : IAdService
    {
        private readonly List<Ad> _mockAds;

        public AdService()
        {
            // Initialize with mock data for development
            _mockAds = new List<Ad>
            {
                new Ad
                {
                    Id = "ad-001",
                    ProjectId = "project-001",
                    Title = "Special Offer",
                    Content = "Get 20% off on your next purchase!",
                    BrandName = "TechCorp",
                    ImageUrl = "https://t4.ftcdn.net/jpg/04/88/06/55/360_F_488065538_8c8VgyQjc5EroxagDRDAFKEEjSukjUge.jpg",
                    ClickUrl = "https://example.com/offer",
                    IsActive = true
                },
                new Ad
                {
                    Id = "ad-002",
                    ProjectId = "project-001",
                    Title = "New Product Launch",
                    Content = "Check out our latest product line",
                    BrandName = "TechCorp",
                    ImageUrl = "https://www.shutterstock.com/image-vector/cashback-icon-credit-card-isolated-600nw-2485671009.jpg",
                    ClickUrl = "https://example.com/new-product",
                    IsActive = true
                },
                new Ad
                {
                    Id = "ad-003",
                    ProjectId = "project-002",
                    Title = "Customer Survey",
                    Content = "Help us improve by taking a quick survey",
                    BrandName = "SurveyPro",
                    ImageUrl = "https://via.placeholder.com/300x200",
                    ClickUrl = "https://example.com/survey",
                    IsActive = true
                },
                new Ad
                {
                    Id = "ad-004",
                    ProjectId = "project-001",
                    Title = "Test Fallback Image",
                    Content = "This ad has an invalid image URL to test fallback",
                    BrandName = "TestBrand",
                    ImageUrl = "https://invalid-url-that-will-fail.com/image.jpg",
                    ClickUrl = "https://example.com/test",
                    IsActive = true
                }
            };
        }

        public async Task<AdMetadata?> GetAdMetadataAsync(string adId, string projectId)
        {
            // Simulate async operation
            await Task.Delay(100);

            var ad = _mockAds.FirstOrDefault(a => 
                a.Id == adId && 
                a.ProjectId == projectId && 
                a.IsActive);

            if (ad == null)
                return null;

            return new AdMetadata
            {
                Id = ad.Id,
                ProjectId = ad.ProjectId,
                Title = ad.Title,
                Content = ad.Content,
                BrandName = ad.BrandName,
                ImageUrl = ad.ImageUrl,
                ClickUrl = ad.ClickUrl,
                IsActive = ad.IsActive
            };
        }

        public async Task<IEnumerable<AdMetadata>> GetAdsByProjectAsync(string projectId)
        {
            // Simulate async operation
            await Task.Delay(100);

            var ads = _mockAds.Where(a => 
                a.ProjectId == projectId && 
                a.IsActive);

            return ads.Select(ad => new AdMetadata
            {
                Id = ad.Id,
                ProjectId = ad.ProjectId,
                Title = ad.Title,
                Content = ad.Content,
                BrandName = ad.BrandName,
                ImageUrl = ad.ImageUrl,
                ClickUrl = ad.ClickUrl,
                IsActive = ad.IsActive
            });
        }
    }
} 