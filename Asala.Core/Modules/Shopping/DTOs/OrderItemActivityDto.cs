namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderItemActivityDto
{
    public int Id { get; set; }
    public int OrderItemStatusId { get; set; }
    public int OrderItemId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateOrderItemActivityDto
{
    public int OrderItemStatusId { get; set; }
    public int OrderItemId { get; set; }
    public bool IsActive { get; set; } = true;
}
