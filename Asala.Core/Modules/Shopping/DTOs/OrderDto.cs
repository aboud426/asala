namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = [];
    public List<OrderActivityDto> OrderActivities { get; set; } = [];
}

public class CreateOrderDto
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateOrderItemDto> OrderItems { get; set; } = [];
}

public class UpdateOrderDto
{
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public bool IsActive { get; set; }
}

public class OrderSummaryDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}
