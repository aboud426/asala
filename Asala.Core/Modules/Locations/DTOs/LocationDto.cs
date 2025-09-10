namespace Asala.Core.Modules.Locations.DTOs;

public class LocationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int? RegionId { get; set; }
    public string? RegionName { get; set; }
    public string? RegionFullPath { get; set; }
    public int UserId { get; set; }
    public string? UserEmail { get; set; }
    public string? UserName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<LocationLocalizedDto> Localizations { get; set; } = [];
}

public class CreateLocationDto
{
    public string Name { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int? RegionId { get; set; }
    public int UserId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateLocationLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateLocationDto
{
    public string Name { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int? RegionId { get; set; }
    public int UserId { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateLocationLocalizedDto> Localizations { get; set; } = [];
}

public class LocationDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? RegionName { get; set; }
    public string DisplayName { get; set; } = null!;
}

public class LocationSearchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? RegionName { get; set; }
    public double? Distance { get; set; }
}
