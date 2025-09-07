namespace Asala.Core.Modules.Shopping.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int PostId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int CartId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCartItemDto
{
    public int ProductId { get; set; }
    public int PostId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int CartId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}

public class AddToCartDto
{
    public int ProductId { get; set; }
    public int PostId { get; set; }
    public int Quantity { get; set; }
}
