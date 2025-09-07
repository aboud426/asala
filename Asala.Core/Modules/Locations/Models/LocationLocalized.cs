using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Locations.Models;

public class LocationLocalized : BaseEntity<int>
{
    public int LocationId { get; set; }
    public string LocalizedName { get; set; } = null!;
    public int LanguageId { get; set; }

    // Navigation properties
    public Language Language { get; set; } = null!;
    public Location Location { get; set; } = null!;
}
