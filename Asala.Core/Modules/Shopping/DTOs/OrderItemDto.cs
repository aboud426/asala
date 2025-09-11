namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int? PostId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public int ProviderId { get; set; }
    public int CurrencyId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Product Information
    public OrderItemProductDto Product { get; set; } = new();

    // Provider Information
    public OrderItemProviderDto Provider { get; set; } = new();

    // Currency Information
    public OrderItemCurrencyDto Currency { get; set; } = new();

    // Post Information (if applicable)
    public OrderItemPostDto? Post { get; set; }

    // Activities
    public List<OrderItemActivityDto> Activities { get; set; } = [];
}

public class OrderItemProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class OrderItemProviderDto
{
    public int UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? ImageUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

public class OrderItemCurrencyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}

public class OrderItemPostDto
{
    public int Id { get; set; }
    public string? Description { get; set; }
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public int? PostId { get; set; }
}
