namespace Asala.Core.Modules.Categories.DTOs;

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductCategoryDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductCategoryDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
}

public class ProductCategoryDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
}
