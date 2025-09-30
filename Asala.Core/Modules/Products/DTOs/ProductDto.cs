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
    public int CurrencyId { get; set; }
    public string CurrencyName { get; set; } = null!;
    public string CurrencyCode { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
    public string? Description { get; set; }
    public string? LocalizedDescription { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductLocalizedDto> Localizations { get; set; } = [];
    public List<ImageUrlDto> Images { get; set; } = [];
    public List<ProductAttributeAssignmentDto> AttributeAssignments { get; set; } = [];
}

public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateProductLocalizedDto> Localizations { get; set; } = [];
    public List<CreateProductAttributeAssignmentDto> AttributeAssignments { get; set; } = [];
}

public class UpdateProductDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateProductLocalizedDto> Localizations { get; set; } = [];
    public List<UpdateProductAttributeAssignmentDto> AttributeAssignments { get; set; } = [];
}

public class ProductDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
}

public class ProductLocalizedDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!; // Will be localized if available, fallback to original
    public decimal Price { get; set; }
    public int CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
}

public class ProductTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
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
    public int CurrencyId { get; set; }
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
    public int CurrencyId { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateProductLocalizedDto> Localizations { get; set; } = [];
    public List<ImageUrlDto> Images { get; set; } = [];
}

// Product Attribute Assignment DTOs
public class ProductAttributeAssignmentDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int ProductAttributeValueId { get; set; }
    public string AttributeName { get; set; } = null!;
    public string AttributeValue { get; set; } = null!;
    public string? LocalizedAttributeName { get; set; }
    public string? LocalizedAttributeValue { get; set; }
    public bool IsActive { get; set; }
}

public class CreateProductAttributeAssignmentDto
{
    public int ProductAttributeValueId { get; set; }
}

public class UpdateProductAttributeAssignmentDto
{
    public int? Id { get; set; }
    public int ProductAttributeValueId { get; set; }
}

// Product Filter DTOs
public class ProductFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? LanguageCode { get; set; } = "en";
    public bool? ActiveOnly { get; set; } = true;
    public string? SearchTerm { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? CurrencyId { get; set; }
    public List<ProductAttributeFilterDto> AttributeFilters { get; set; } = [];
    public ProductSortBy SortBy { get; set; } = ProductSortBy.CreatedAt;
    public bool SortDescending { get; set; } = true;
}

public class ProductAttributeFilterDto
{
    public int AttributeId { get; set; }
    public List<int> ValueIds { get; set; } = [];
}

public class ProductFilterResultDto
{
    public List<ProductDto> Products { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public ProductFilterSummaryDto FilterSummary { get; set; } = new();
}

public class ProductFilterSummaryDto
{
    public List<CategoryFilterSummaryDto> AvailableCategories { get; set; } = [];
    public List<AttributeFilterSummaryDto> AvailableAttributes { get; set; } = [];
    public PriceRangeDto PriceRange { get; set; } = new();
}

public class CategoryFilterSummaryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public string? LocalizedCategoryName { get; set; }
    public int ProductCount { get; set; }
}

public class AttributeFilterSummaryDto
{
    public int AttributeId { get; set; }
    public string AttributeName { get; set; } = null!;
    public string? LocalizedAttributeName { get; set; }
    public List<AttributeValueFilterSummaryDto> Values { get; set; } = [];
}

public class AttributeValueFilterSummaryDto
{
    public int ValueId { get; set; }
    public string Value { get; set; } = null!;
    public string? LocalizedValue { get; set; }
    public int ProductCount { get; set; }
}

public class PriceRangeDto
{
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public string CurrencySymbol { get; set; } = null!;
}