using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Locations.Models;

public class LocalizedRegion : BaseEntity<int>
{
    public int RegionId { get; set; }
    public int LanguageId { get; set; }
    public string LocalizedName { get; set; } = null!;

    // Navigation properties
    public Language Language { get; set; } = null!;
    public Region Region { get; set; } = null!;
}
