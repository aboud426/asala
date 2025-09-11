using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderActivityDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public OrderActivityType ActivityType { get; set; }
    public string ActivityTypeName { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateOrderActivityDto
{
    public int OrderId { get; set; }
    public OrderActivityType ActivityType { get; set; }
    public DateTime? ActivityDate { get; set; }
    public bool IsActive { get; set; } = true;
}
