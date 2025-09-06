using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductMedia : BaseEntity<int>
{
    public int ProductId { get; set; }
    public int MediaId { get; set; }
}
