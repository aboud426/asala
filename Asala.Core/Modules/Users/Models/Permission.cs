using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Users.Models;

public class PermissionLocalized : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class Permission : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public List<PermissionLocalized> Localizations { get; set; } = [];
}
