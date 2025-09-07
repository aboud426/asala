using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderItemActivity : BaseEntity<int>
{
    public int OrderItemStatusId { get; set; }
    public int OrderItemId { get; set; }

    // Navigation properties
    public OrderItem OrderItem { get; set; } = null!;
    public OrderItemStatus OrderItemStatus { get; set; } = null!;
}
