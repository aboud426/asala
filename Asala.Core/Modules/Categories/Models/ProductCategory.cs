using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class ProductCategory : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    
   
}
