using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class OrderStatus : BaseEntity<int>
{
    public string Name { get; set; } = null!;

    // Navigation properties
    public List<OrderActivity> OrderActivities { get; set; } = [];
}
