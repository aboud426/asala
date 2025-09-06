using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class ProductCategory : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public string? ImageUrl { get; set; }
}
