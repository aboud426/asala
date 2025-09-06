namespace Asala.Core.Modules.Categories.DTOs;

public class ProductCategoryLocalizedDto
{
    public int Id { get; set; }
    public int ProductCategoryId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public string LanguageName { get; set; } = null!;
    public string LanguageCode { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductCategoryLocalizedDto
{
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
}

public class UpdateProductCategoryLocalizedDto
{
    public int? Id { get; set; } // Null for new translations
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; } = true;
}
