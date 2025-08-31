using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class UserRole : BaseEntity<int>
{
    public int UserId { get; set; }
    public int RoleId { get; set; }

}
