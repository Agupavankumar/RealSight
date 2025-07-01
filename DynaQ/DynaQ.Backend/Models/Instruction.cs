using Amazon.DynamoDBv2.DataModel;
using System.ComponentModel.DataAnnotations;

namespace DynaQ.Backend.Models
{
    [DynamoDBTable("Instructions")]
    public class Instruction
    {
		[DynamoDBHashKey]
		public string Id { get; set; } = Guid.NewGuid().ToString();

		[DynamoDBProperty]
		public string Type { get; set; } = string.Empty;

		[DynamoDBProperty]
		public string Action { get; set; } = string.Empty;

		[DynamoDBProperty]
		public bool Publish { get; set; }

		[DynamoDBProperty]
		public string Selector { get; set; } = string.Empty;

		[DynamoDBProperty]
		public string? Content { get; set; }

		[DynamoDBProperty]
		public string Timestamp { get; set; } = string.Empty;
	}
    
    public class CreateInstructionRequest
    {
        [Required]
        [RegularExpression("^(appendHTML|replaceHTML|removeElement)$", ErrorMessage = "Action must be one of: appendHTML, replaceHTML, removeElement")]
        public string Action { get; set; } = string.Empty;

		[Required]
		public string Type { get; set; } = string.Empty;

		[Required]
        public string Selector { get; set; } = string.Empty;
        
        public string? Content { get; set; }
        
        public bool Publish { get; set; } = false;
    }
    
    public class UpdateInstructionRequest
    {
        [RegularExpression("^(appendHTML|replaceHTML|removeElement)$", ErrorMessage = "Action must be one of: appendHTML, replaceHTML, removeElement")]
        public string? Action { get; set; }
        
        public string? Selector { get; set; }
        
        public string? Content { get; set; }
        
        public bool? Publish { get; set; }
    }
}