namespace Asala.Core.Modules.Shopping.DTOs;

public class CartDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CartItemDto> CartItems { get; set; } = [];
}

public class CreateCartDto
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class UpdateCartDto
{
    public decimal TotalAmount { get; set; }
    public bool IsActive { get; set; }
}

public class CartSummaryDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}
