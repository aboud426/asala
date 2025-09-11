using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class Order : BaseEntity<int>
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Initial;
    public OrderPaymentStatus PaymentStatus { get; set; } = OrderPaymentStatus.Unpaid;
    public OrderPaymentMethod PaymentMethod { get; set; } = OrderPaymentMethod.NoYetSpecified;

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

public enum OrderPaymentStatus
{
    Paid = 1,
    Unpaid = 2,
    Refunded = 3,
    PaidRequested = 4,
}

public enum OrderPaymentMethod
{
    NoYetSpecified = 0,
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
}
