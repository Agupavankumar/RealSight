using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface IAdService
    {
        Task<AdMetadata?> GetAdMetadataAsync(string adId, string projectId);
        Task<IEnumerable<AdMetadata>> GetAdsByProjectAsync(string projectId);
        Task<Ad> CreateAdAsync(Ad ad);
        Task<Ad?> UpdateAdAsync(string adId, string projectId, Ad updatedAd);
        Task<bool> DeleteAdAsync(string adId, string projectId);
    }
} 