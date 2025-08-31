namespace Asala.Core.Modules.Categories.DTOs;

public class CategoryLocalizedDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LocalizedName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCategoryLocalizedDto
{
    public int CategoryId { get; set; }
    public int LanguageId { get; set; }
    public string LocalizedName { get; set; } = null!;
}

public class UpdateCategoryLocalizedDto
{
    public string LocalizedName { get; set; } = null!;
}
