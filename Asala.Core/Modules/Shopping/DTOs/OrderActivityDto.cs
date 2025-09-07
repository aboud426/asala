namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderActivityDto
{
    public int Id { get; set; }
    public int OrderStatusId { get; set; }
    public int OrderId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateOrderActivityDto
{
    public int OrderStatusId { get; set; }
    public int OrderId { get; set; }
    public bool IsActive { get; set; } = true;
}
