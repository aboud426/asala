namespace Asala.Core.Modules.ClientPages.DTOs;

public class ProductsPagesDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductsPagesLocalizedDto> Localizations { get; set; } =
        new List<ProductsPagesLocalizedDto>();
    public List<IncludedProductTypeDto> IncludedProductTypes { get; set; } =
        new List<IncludedProductTypeDto>();
}

public class CreateProductsPagesDto
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<CreateProductsPagesLocalizedDto> Localizations { get; set; } =
        new List<CreateProductsPagesLocalizedDto>();
    public List<int> IncludedProductCategoryIds { get; set; } = new List<int>();
}

public class UpdateProductsPagesDto
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdateProductsPagesLocalizedDto> Localizations { get; set; } =
        new List<UpdateProductsPagesLocalizedDto>();
    public List<int> IncludedProductCategoryIds { get; set; } = new List<int>();
}

public class ProductsPagesDropdownDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class ProductsPagesLocalizedDto
{
    public int Id { get; set; }
    public int ProductsPagesId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductsPagesLocalizedDto
{
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
}

public class UpdateProductsPagesLocalizedDto
{
    public int? Id { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
}

public class IncludedProductTypeDto
{
    public int Id { get; set; }
    public int ProductsPagesId { get; set; }
    public int ProductCategoryId { get; set; }
    public ProductCategoryDto ProductCategory { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
