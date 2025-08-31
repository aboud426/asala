namespace Asala.Core.Modules.Categories.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
}

public class CategoryDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
}
