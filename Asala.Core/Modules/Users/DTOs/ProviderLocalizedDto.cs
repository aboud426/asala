namespace Asala.Core.Modules.Users.DTOs;

public class ProviderLocalizedDto
{
    public int Id { get; set; }
    public int ProviderId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LanguageName { get; set; } = null!;
    public string BusinessNameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProviderLocalizedDto
{
    public int ProviderId { get; set; }
    public int LanguageId { get; set; }
    public string BusinessNameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateProviderLocalizedDto
{
    public int? Id { get; set; }
    public int LanguageId { get; set; }
    public string BusinessNameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; }
}
