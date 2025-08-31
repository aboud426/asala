namespace Asala.Core.Modules.Categories.DTOs;

public class ProductCategoryLocalizedDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string NameLocalized { get; set; } = null!;
    public string? DecriptionLocalized { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductCategoryLocalizedDto
{
    public int CategoryId { get; set; }
    public int LanguageId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DecriptionLocalized { get; set; }
}

public class UpdateProductCategoryLocalizedDto
{
    public string NameLocalized { get; set; } = null!;
    public string? DecriptionLocalized { get; set; }
}
