using Asala.Core.Modules.Users.DTOs;

namespace Asala.Core.Modules.Products.DTOs;

public enum ProductSortBy
{
    Name,
    Price,
    CreatedAt,
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string LocalizedName { get; set; } = null!;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int ProviderId { get; set; }
    public string? ProviderName { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public string? LocalizedDescription { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductLocalizedDto> Localizations { get; set; } = [];
    public List<ImageUrlDto> Images { get; set; } = [];
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
    public List<CreateProductLocalizedDto> Localizations { get; set; } = [];
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
    public List<UpdateProductLocalizedDto> Localizations { get; set; } = [];
}

public class ProductDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
}

public class ProductLocalizedDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!; // Will be localized if available, fallback to original
    public decimal Price { get; set; }
}

public class ProductTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; }
    public List<ProductLocalizedDto> Localizations { get; set; } = [];
    public List<ProductTreeDto> Children { get; set; } = new List<ProductTreeDto>();
}

public class CreateProductByAdminDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateProductLocalizedDto> Localizations { get; set; } = [];
    public List<ImageUrlDto> Images { get; set; } = [];
}

public class UpdateProductByAdminDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateProductLocalizedDto> Localizations { get; set; } = [];
    public List<ImageUrlDto> Images { get; set; } = [];
}
