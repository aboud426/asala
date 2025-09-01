namespace Asala.Core.Modules.Categories.DTOs;

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductCategoryLocalizedDto> Localizations { get; set; } = [];
}

public class CreateProductCategoryDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateProductCategoryLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateProductCategoryDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateProductCategoryLocalizedDto> Localizations { get; set; } = [];
}

public class ProductCategoryDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
}

public class ProductCategoryTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public List<ProductCategoryLocalizedDto> Localizations { get; set; } = [];
    public List<ProductCategoryTreeDto> Children { get; set; } = new List<ProductCategoryTreeDto>();
}