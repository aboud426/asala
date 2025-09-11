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
    Initial = 1,
    Prepairing = 2,
    ReadyToShip = 3,
    InShipping = 4,
    Delivered = 5,
}
