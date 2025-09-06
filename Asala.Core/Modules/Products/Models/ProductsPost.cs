using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductsPost : BaseEntity<int>
{
    public int PostId { get; set; }
    public int ProductId { get; set; }
}
