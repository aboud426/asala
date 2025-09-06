using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class Product : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
}
