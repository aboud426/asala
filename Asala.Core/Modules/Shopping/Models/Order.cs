using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class Order : BaseEntity<int>
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public OrderStatus Status { get; set; }
    public OrderPaymentStatus PaymentStatus { get; set; }
    public OrderPaymentMethod PaymentMethod { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Location ShippingAddress { get; set; } = null!;
    public List<OrderActivity> OrderActivities { get; set; } = [];
    public List<OrderItem> OrderItems { get; set; } = [];
}

public enum OrderStatus
{
    Initial = 1,
    Prepairing = 2,
    ReadyToShip = 3,
    InShipping = 4,
    Delivered = 5,
}

public enum OrderItemStatus
{
    Initial = 1,
    Pending = 2,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4,
    Completed = 5,
}

public enum OrderPaymentStatus
{
    Paid = 1,
    Unpaid = 2,
    Refunded = 3,
    PaidRequested = 4,
}

public enum OrderPaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
}
