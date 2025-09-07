namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderItemStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateOrderItemStatusDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateOrderItemStatusDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class OrderItemStatusDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
