using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class User : BaseEntity<int>
{
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? PasswordHash { get; set; } // Optional - only for Employee users
    public int? LocationId { get; set; }


}
