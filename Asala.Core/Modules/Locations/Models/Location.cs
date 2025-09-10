using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Locations.Models;

public class Location : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public int? RegionId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Navigation properties
    public Region? Region { get; set; }
    public List<LocationLocalized> LocationLocalizeds { get; set; } = [];
    public List<Order> Orders { get; set; } = [];
}
