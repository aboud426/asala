using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderActivity : BaseEntity<int>
{
    public int OrderId { get; set; }
    public OrderActivityType OrderActivityType { get; set; }
    public DateTime ActivityDate { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
}

public enum OrderActivityType
{
    Submitted = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
    Completed = 5,
}
