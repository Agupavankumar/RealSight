using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public interface IInstructionService
    {
        Task<IEnumerable<Instruction>> GetAllInstructionsAsync();
        Task<Instruction?> GetInstructionByIdAsync(string id);
        Task<Instruction> CreateInstructionAsync(CreateInstructionRequest request);
        Task<Instruction?> UpdateInstructionAsync(string id, UpdateInstructionRequest request);
        Task<bool> DeleteInstructionAsync(string id);
        Task<IEnumerable<Instruction>> GetPublishedInstructionsAsync();
        Task<int> DeleteAllInstructionsAsync();
    }
}