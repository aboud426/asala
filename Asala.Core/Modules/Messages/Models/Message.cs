using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Messages.Models;

public class MessageLocalized : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string Text { get; set; } = null!;
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    public int MessageId { get; set; }
    public Message Message { get; set; } = null!;
}

public class Message : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string DefaultText { get; set; } = string.Empty;
    public List<MessageLocalized> Localizations { get; set; } = [];
}
