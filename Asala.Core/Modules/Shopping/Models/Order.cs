using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class Order : BaseEntity<int>
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Location ShippingAddress { get; set; } = null!;
    public List<OrderActivity> OrderActivities { get; set; } = [];
    public List<OrderItem> OrderItems { get; set; } = [];
}
