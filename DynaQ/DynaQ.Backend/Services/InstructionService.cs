using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DynaQ.Backend.Models;

namespace DynaQ.Backend.Services
{
    public class InstructionService : IInstructionService
    {
        private readonly IDynamoDBContext _dbContext;
        
        public InstructionService(IDynamoDBContext dbContext)
        {
            _dbContext = dbContext;
        }
        
        public async Task<IEnumerable<Instruction>> GetAllInstructionsAsync()
        {
            var scanConditions = new List<ScanCondition>();
            var results = await _dbContext.ScanAsync<Instruction>(scanConditions).GetRemainingAsync();
            return results;
        }
        
        public async Task<Instruction?> GetInstructionByIdAsync(string id)
        {
            try
            {
                var instruction = await _dbContext.LoadAsync<Instruction>(id);
                return instruction;
            }
            catch
            {
                return null;
            }
        }
        
        public async Task<Instruction> CreateInstructionAsync(CreateInstructionRequest request)
        {
            var instruction = new Instruction
            {
                Action = request.Action,
                Type = request.Type,
				Selector = request.Selector,
                Content = request.Content,
                Publish = request.Publish,
                Timestamp = DateTime.UtcNow.ToString("o")
            };
            
            await _dbContext.SaveAsync(instruction);
            return instruction;
        }
        
        public async Task<Instruction?> UpdateInstructionAsync(string id, UpdateInstructionRequest request)
        {
            var existingInstruction = await _dbContext.LoadAsync<Instruction>(id);
            if (existingInstruction == null)
            {
                return null;
            }
            
            if (request.Action != null)
            {
                existingInstruction.Action = request.Action;
            }
            
            if (request.Selector != null)
            {
                existingInstruction.Selector = request.Selector;
            }
            
            if (request.Content != null)
            {
                existingInstruction.Content = request.Content;
            }
            
            if (request.Publish.HasValue)
            {
                existingInstruction.Publish = request.Publish.Value;
            }
            
            existingInstruction.Timestamp = DateTime.UtcNow.ToString("o");
            
            await _dbContext.SaveAsync(existingInstruction);
            return existingInstruction;
        }
        
        public async Task<bool> DeleteInstructionAsync(string id)
        {
            try
            {
                var existingInstruction = await _dbContext.LoadAsync<Instruction>(id);
                if (existingInstruction == null)
                {
                    return false;
                }
                
                await _dbContext.DeleteAsync<Instruction>(id);
                return true;
            }
            catch
            {
                return false;
            }
        }
        
        public async Task<IEnumerable<Instruction>> GetPublishedInstructionsAsync()
        {
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("Publish", ScanOperator.Equal, true)
            };
            
            var results = await _dbContext.ScanAsync<Instruction>(conditions).GetRemainingAsync();
            return results;
        }
        
        public async Task<int> DeleteAllInstructionsAsync()
        {
            try
            {
                // Get all instructions
                var allInstructions = await GetAllInstructionsAsync();
                var count = 0;
                
                // Delete each instruction
                foreach (var instruction in allInstructions)
                {
                    await _dbContext.DeleteAsync<Instruction>(instruction.Id);
                    count++;
                }
                
                return count;
            }
            catch
            {
                return 0;
            }
        }
    }
}