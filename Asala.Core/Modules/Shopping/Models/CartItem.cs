using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class CartItem : BaseEntity<int>
{
    public int ProductId { get; set; }
    public int PostId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int CartId { get; set; }

    // Navigation properties
    public Cart Cart { get; set; } = null!;
    public Post Post { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
