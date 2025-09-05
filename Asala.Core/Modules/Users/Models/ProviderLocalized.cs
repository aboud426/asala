using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class ProviderLocalized : BaseEntity<int>
{
    public int ProviderId { get; set; }
    public string BusinessNameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
}
