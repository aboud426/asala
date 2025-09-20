using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductMedia : BaseEntity<int>
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Url { get; set; } = null!;
    public MediaType MediaType { get; set; }
}
