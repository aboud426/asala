using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductAttributeValue : BaseEntity<int>
{
    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;
    
    public string Value { get; set; } = null!;

    // Navigation properties
    public List<ProductAttributeValueLocalized> ProductAttributeValueLocalizeds { get; set; } = [];
    public List<ProductAttributeAssignment> ProductAttributeAssignments { get; set; } = [];
}
