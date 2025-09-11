using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderItemActivityDto
{
    public int Id { get; set; }
    public int OrderItemId { get; set; }
    public OrderItemActivityType ActivityType { get; set; }
    public string ActivityTypeName { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateOrderItemActivityDto
{
    public int OrderItemId { get; set; }
    public OrderItemActivityType ActivityType { get; set; }
    public DateTime? ActivityDate { get; set; }
    public bool IsActive { get; set; } = true;
}
