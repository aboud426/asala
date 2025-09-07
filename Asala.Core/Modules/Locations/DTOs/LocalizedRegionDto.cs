namespace Asala.Core.Modules.Locations.DTOs;

public class LocalizedRegionDto
{
    public int Id { get; set; }
    public int RegionId { get; set; }
    public int LanguageId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public string LanguageName { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateLocalizedRegionDto
{
    public int RegionId { get; set; }
    public int LanguageId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdateLocalizedRegionDto
{
    public int LanguageId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public bool IsActive { get; set; }
}
