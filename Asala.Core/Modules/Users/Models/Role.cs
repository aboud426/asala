using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Users.Models;

public class RoleLocalized : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

public class Role : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public List<RoleLocalized> Localizations { get; set; } = [];
}
