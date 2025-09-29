using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductAttributeAssignment : BaseEntity<int>
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public int ProductAttributeValueId { get; set; }
    public ProductAttributeValue ProductAttributeValue { get; set; } = null!;
}
