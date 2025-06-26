using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class AdService : IAdService
    {
        private readonly IDynamoDBContext _dbContext;

        public AdService(IDynamoDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AdMetadata?> GetAdMetadataAsync(string adId, string projectId)
        {
            var ad = await _dbContext.LoadAsync<Ad>(adId, projectId);
            if (ad == null || !ad.IsActive) return null;

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
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("ProjectId", ScanOperator.Equal, projectId),
                new ScanCondition("IsActive", ScanOperator.Equal, true)
            };
            var ads = await _dbContext.ScanAsync<Ad>(conditions).GetRemainingAsync();
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

        public async Task<Ad> CreateAdAsync(Ad ad)
        {
            // The GUID is already set in the model constructor, so we don't need to set it here
            // Just ensure we set the timestamps
            ad.Id= Guid.NewGuid().ToString();
			ad.CreatedAt = DateTime.UtcNow;
            ad.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveAsync(ad);
            return ad;
        }

        public async Task<Ad?> UpdateAdAsync(string adId, string projectId, Ad updatedAd)
        {
            var ad = await _dbContext.LoadAsync<Ad>(adId, projectId);
            if (ad == null) return null;

            ad.Title = updatedAd.Title;
            ad.Content = updatedAd.Content;
            ad.BrandName = updatedAd.BrandName;
            ad.ImageUrl = updatedAd.ImageUrl;
            ad.ClickUrl = updatedAd.ClickUrl;
            ad.IsActive = updatedAd.IsActive;
            ad.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveAsync(ad);
            return ad;
        }

        public async Task<bool> DeleteAdAsync(string adId, string projectId)
        {
            var ad = await _dbContext.LoadAsync<Ad>(adId, projectId);
            if (ad == null) return false;

            // Option 1: Hard delete
            // await _dbContext.DeleteAsync<Ad>(adId, projectId);
            
            // Option 2: Soft delete - mark as inactive but keep in database
            ad.IsActive = false;
            ad.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveAsync(ad);
            
            return true;
        }
    }
}