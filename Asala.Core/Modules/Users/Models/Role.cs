using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class Role : BaseEntity<int>
{
    public string Name { get; set; } = null!;
}
