namespace Asala.Core.Modules.Products.DTOs;

public class ProductAttributeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductAttributeLocalizedDto> Localizations { get; set; } = [];
    public List<ProductAttributeValueDto> Values { get; set; } = [];
}

public class ProductAttributeLocalizedDto
{
    public int Id { get; set; }
    public int ProductAttributeId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LanguageName { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class ProductAttributeValueDto
{
    public int Id { get; set; }
    public int ProductAttributeId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ProductAttributeValueLocalizedDto> Localizations { get; set; } = [];
    public DateTime UpdatedAt { get; set; }
}

public class ProductAttributeValueLocalizedDto
{
    public int Id { get; set; }
    public int ProductAttributeValueId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LanguageName { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class CreateProductAttributeDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public List<CreateProductAttributeLocalizedDto> Localizations { get; set; } = [];
}

public class CreateProductAttributeLocalizedDto
{
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateProductAttributeDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdateProductAttributeLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateProductAttributeLocalizedDto
{
    public int? Id { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class AddProductAttributeLocalizationDto
{
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class ProductAttributeDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? LocalizedName { get; set; }
}

// ProductAttributeValue DTOs
public class CreateProductAttributeValueDto
{
    public int ProductAttributeId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public List<CreateProductAttributeValueLocalizedDto> Localizations { get; set; } = [];
}

public class CreateProductAttributeValueLocalizedDto
{
    public int LanguageId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateProductAttributeValueDto
{
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdateProductAttributeValueLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateProductAttributeValueLocalizedDto
{
    public int? Id { get; set; }
    public int LanguageId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class AddProductAttributeValueLocalizationDto
{
    public int LanguageId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class ProductAttributeValueDropdownDto
{
    public int Id { get; set; }
    public string Value { get; set; } = null!;
    public string? LocalizedValue { get; set; }
    public int ProductAttributeId { get; set; }
    public string ProductAttributeName { get; set; } = null!;
}
