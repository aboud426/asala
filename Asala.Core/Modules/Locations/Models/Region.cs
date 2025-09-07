using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Locations.Models;

public class Region : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public int? ParentId { get; set; }

    // Navigation properties
    public Region? Parent { get; set; }
    public List<Region> InverseParent { get; set; } = [];
    public List<LocalizedRegion> LocalizedRegions { get; set; } = [];
    public List<Location> Locations { get; set; } = [];
}
