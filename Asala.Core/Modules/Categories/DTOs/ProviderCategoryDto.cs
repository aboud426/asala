namespace Asala.Core.Modules.Categories.DTOs;

public class ProviderCategoryDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProviderCategoryDto
{
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProviderCategoryDto
{
    public bool IsActive { get; set; }
}
