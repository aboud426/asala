using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderItem : BaseEntity<int>
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int? PostId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public int ProviderId { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Post? Post { get; set; }
    public Provider Provider { get; set; } = null!;
    public List<OrderItemActivity> OrderItemActivities { get; set; } = [];
}
