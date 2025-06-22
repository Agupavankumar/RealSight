using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface IAdService
    {
        Task<AdMetadata?> GetAdMetadataAsync(string adId, string projectId);
        Task<IEnumerable<AdMetadata>> GetAdsByProjectAsync(string projectId);
    }
} 