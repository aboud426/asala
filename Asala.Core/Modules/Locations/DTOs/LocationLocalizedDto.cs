namespace Asala.Core.Modules.Locations.DTOs;

public class LocationLocalizedDto
{
    public int Id { get; set; }
    public int LocationId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public int LanguageId { get; set; }
    public string LanguageName { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateLocationLocalizedDto
{
    public int LocationId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateLocationLocalizedDto
{
    public string LocalizedName { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
}
