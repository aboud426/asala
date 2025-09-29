using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductAttribute : BaseEntity<int>
{
    public string Name { get; set; } = null!;

    // Navigation properties
    public List<ProductAttributeLocalized> ProductAttributeLocalizeds { get; set; } = [];
    public List<ProductAttributeValue> ProductAttributeValues { get; set; } = [];
}
