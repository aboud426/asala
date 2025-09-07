using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderActivity : BaseEntity<int>
{
    public int OrderStatusId { get; set; }
    public int OrderId { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public OrderStatus OrderStatus { get; set; } = null!;
}
