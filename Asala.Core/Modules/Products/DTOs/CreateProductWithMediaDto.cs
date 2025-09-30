namespace Asala.Core.Modules.Products.DTOs;

public class CreateProductWithMediaDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new List<string>();
    public bool IsActive { get; set; } = true;
    public List<CreateProductLocalizedDto> Localizeds { get; set; } = [];
    public List<CreateProductAttributeAssignmentDto> AttributeAssignments { get; set; } = [];
}

public class UpdateProductWithMediaDto
{
    public string Name { get; set; } = null!;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CurrencyId { get; set; }
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new List<string>();
    public bool IsActive { get; set; }
    public List<UpdateProductLocalizedDto> Localizations { get; set; } = [];
    public List<UpdateProductAttributeAssignmentDto> AttributeAssignments { get; set; } = [];
}