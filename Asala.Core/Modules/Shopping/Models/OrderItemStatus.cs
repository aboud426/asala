using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderItemStatus : BaseEntity<int>
{
    public string Name { get; set; } = null!;

    // Navigation properties
    public List<OrderItemActivity> OrderItemActivities { get; set; } = [];
}
