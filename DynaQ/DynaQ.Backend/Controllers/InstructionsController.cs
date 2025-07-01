using Microsoft.AspNetCore.Mvc;
using DynaQ.Backend.Models;
using DynaQ.Backend.Services;

namespace DynaQ.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstructionsController : ControllerBase
    {
        private readonly IInstructionService _instructionService;
        private readonly ILogger<InstructionsController> _logger;
        
        public InstructionsController(IInstructionService instructionService, ILogger<InstructionsController> logger)
        {
            _instructionService = instructionService;
            _logger = logger;
        }
        
        /// <summary>
        /// Gets all instructions
        /// </summary>
        /// <returns>List of all instructions</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllInstructions()
        {
            try
            {
                var instructions = await _instructionService.GetAllInstructionsAsync();
                return Ok(instructions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all instructions");
                return StatusCode(500, new { error = "An error occurred while retrieving instructions" });
            }
        }
        
        /// <summary>
        /// Gets an instruction by ID
        /// </summary>
        /// <param name="id">The instruction ID</param>
        /// <returns>The instruction with the specified ID</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInstructionById(string id)
        {
            try
            {
                var instruction = await _instructionService.GetInstructionByIdAsync(id);
                if (instruction == null)
                {
                    return NotFound(new { error = "Instruction not found" });
                }
                
                return Ok(instruction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving instruction with ID {InstructionId}", id);
                return StatusCode(500, new { error = $"An error occurred while retrieving instruction with ID {id}" });
            }
        }
        
        /// <summary>
        /// Creates a new instruction
        /// </summary>
        /// <param name="request">The instruction creation request</param>
        /// <returns>The newly created instruction</returns>
        [HttpPost]
        public async Task<IActionResult> CreateInstruction([FromBody] CreateInstructionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                var instruction = await _instructionService.CreateInstructionAsync(request);
                return CreatedAtAction(nameof(GetInstructionById), new { id = instruction.Id }, instruction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating instruction");
                return StatusCode(500, new { error = "An error occurred while creating the instruction" });
            }
        }
        
        /// <summary>
        /// Updates an existing instruction
        /// </summary>
        /// <param name="id">The ID of the instruction to update</param>
        /// <param name="request">The instruction update request</param>
        /// <returns>The updated instruction</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInstruction(string id, [FromBody] UpdateInstructionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                var updatedInstruction = await _instructionService.UpdateInstructionAsync(id, request);
                if (updatedInstruction == null)
                {
                    return NotFound(new { error = "Instruction not found" });
                }
                
                return Ok(updatedInstruction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating instruction with ID {InstructionId}", id);
                return StatusCode(500, new { error = $"An error occurred while updating instruction with ID {id}" });
            }
        }
        
        /// <summary>
        /// Deletes an instruction
        /// </summary>
        /// <param name="id">The ID of the instruction to delete</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstruction(string id)
        {
            try
            {
                var deleted = await _instructionService.DeleteInstructionAsync(id);
                if (!deleted)
                {
                    return NotFound(new { error = "Instruction not found" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting instruction with ID {InstructionId}", id);
                return StatusCode(500, new { error = $"An error occurred while deleting instruction with ID {id}" });
            }
        }
        
        /// <summary>
        /// Gets all published instructions
        /// </summary>
        /// <returns>List of all published instructions</returns>
        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedInstructions()
        {
            try
            {
                var instructions = await _instructionService.GetPublishedInstructionsAsync();
                return Ok(instructions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving published instructions");
                return StatusCode(500, new { error = "An error occurred while retrieving published instructions" });
            }
        }
        
        /// <summary>
        /// Deletes all instructions
        /// </summary>
        /// <returns>The number of instructions deleted</returns>
        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAllInstructions()
        {
            try
            {
                var count = await _instructionService.DeleteAllInstructionsAsync();
                return Ok(new { message = $"Successfully deleted {count} instructions" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all instructions");
                return StatusCode(500, new { error = "An error occurred while deleting all instructions" });
            }
        }
    }
}