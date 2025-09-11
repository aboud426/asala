using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public OrderStatus Status { get; set; }
    public OrderPaymentStatus PaymentStatus { get; set; }
    public OrderPaymentMethod PaymentMethod { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // User Information
    public OrderUserDto User { get; set; } = new();

    // Shipping Address Information
    public OrderShippingAddressDto ShippingAddress { get; set; } = new();

    // Related Collections
    public List<OrderItemDto> OrderItems { get; set; } = [];
    public List<OrderActivityDto> OrderActivities { get; set; } = [];
}

public class OrderUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProviderBusinessName { get; set; }
    public string? CustomerName { get; set; }
}

public class OrderShippingAddressDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? RegionName { get; set; }
}

public class CreateOrderDto
{
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public List<CreateOrderItemDto> OrderItems { get; set; } = [];
}

public class UpdateOrderDto
{
    public decimal TotalAmount { get; set; }
    public int ShippingAddressId { get; set; }
    public OrderStatus Status { get; set; }
    public OrderPaymentStatus PaymentStatus { get; set; }
    public OrderPaymentMethod PaymentMethod { get; set; }
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
