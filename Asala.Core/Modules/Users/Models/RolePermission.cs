using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class RolePermission : BaseEntity<int>
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

}
