using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Users.Models;

public class ProviderLocalized : BaseEntity<int>
{
    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public string BusinessNameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
}
