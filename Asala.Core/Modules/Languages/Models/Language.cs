using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Languages;

public class Language : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
}
