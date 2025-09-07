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

    // Navigation properties
    public Region? Region { get; set; }
    public List<LocationLocalized> LocationLocalizeds { get; set; } = [];
    public List<Order> Orders { get; set; } = [];
    public List<User> Users { get; set; } = [];
}
