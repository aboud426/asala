using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class Permission : BaseEntity<int>
{
    public string Name { get; set; } = null!;
}
