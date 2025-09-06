using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Users.Models;

public class Currency : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public List<CurrencyLocalized> Localizations { get; set; } = [];
}

public class CurrencyLocalized : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    public int CurrencyId { get; set; }
    public Currency Currency { get; set; } = null!;
}
