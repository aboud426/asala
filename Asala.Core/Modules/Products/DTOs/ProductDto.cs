namespace Asala.Core.Modules.Products.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? LocalizedName { get; set; }
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public string? LocalizedDescription { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class ProductDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
}
