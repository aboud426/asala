using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderItemActivity : BaseEntity<int>
{
    public int OrderItemId { get; set; }
    public OrderItemActivityType OrderItemActivityType { get; set; }
    public DateTime ActivityDate { get; set; }

    // Navigation properties
    public OrderItem OrderItem { get; set; } = null!;
}

public enum OrderItemActivityType
{
    Submitted = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
    Completed = 5,
}
