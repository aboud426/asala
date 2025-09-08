using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Users.Models;

public class User : BaseEntity<int>
{
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? PasswordHash { get; set; } // Optional - only for Employee users
    public int? LocationId { get; set; }

    // Navigation properties
    public Location? Location { get; set; }
    public Provider? Provider { get; set; }
    public Employee? Employee { get; set; }
    public Customer? Customer { get; set; }
}
