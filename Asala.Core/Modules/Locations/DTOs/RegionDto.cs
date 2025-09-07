namespace Asala.Core.Modules.Locations.DTOs;

public class RegionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public string? ParentName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<RegionDto> Children { get; set; } = [];
    public List<LocalizedRegionDto> Localizations { get; set; } = [];
}

public class CreateRegionDto
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateLocalizedRegionDto> Localizations { get; set; } = [];
}

public class UpdateRegionDto
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateLocalizedRegionDto> Localizations { get; set; } = [];
}

public class RegionDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }
    public string FullPath { get; set; } = null!;
}

public class RegionHierarchyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Level { get; set; }
    public List<RegionHierarchyDto> Children { get; set; } = [];
}
