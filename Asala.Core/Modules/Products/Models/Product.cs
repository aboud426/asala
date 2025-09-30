using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Products.Models;

public class Product : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public ProductCategory ProductCategory { get; set; } = null!;
    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
    public Currency Currency { get; set; } = null!;
    public List<ProductLocalized> ProductLocalizeds { get; set; } = [];
    public List<ProductMedia> ProductMedias { get; set; } = [];
    public List<ProductAttributeAssignment> ProductAttributeAssignments { get; set; } = [];
}
