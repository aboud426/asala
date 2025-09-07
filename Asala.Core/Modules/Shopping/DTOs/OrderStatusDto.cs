namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateOrderStatusDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateOrderStatusDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class OrderStatusDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
