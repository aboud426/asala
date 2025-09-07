namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int? PostId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int ProviderId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemActivityDto> Activities { get; set; } = [];
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int? PostId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateOrderItemDto
{
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}
