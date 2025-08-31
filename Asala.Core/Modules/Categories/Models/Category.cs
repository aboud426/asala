using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class Category : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    
}
