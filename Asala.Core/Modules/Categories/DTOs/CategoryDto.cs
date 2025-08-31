namespace Asala.Core.Modules.Categories.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? LocalizedName { get; set; }
    public string? LocalizedDescription { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
}

public class CategoryDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
}

public class CategoryTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? LocalizedName { get; set; }
    public string? LocalizedDescription { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public List<CategoryTreeDto> Children { get; set; } = new List<CategoryTreeDto>();
}
