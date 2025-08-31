using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class User : BaseEntity<int>
{
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public int? LocationId { get; set; }


}
