namespace Asala.Core.Modules.Products.DTOs;

public class ProductLocalizedDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LanguageName { get; set; } = null!;
    public string NameLocalized { get; set; } = null!;
    public string? DescriptionLocalized { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductLocalizedDto
{
    public int ProductId { get; set; }
    public int LanguageId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DescriptionLocalized { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductLocalizedDto
{
    public int? Id { get; set; }
    public int LanguageId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DescriptionLocalized { get; set; }
    public bool IsActive { get; set; }
}
