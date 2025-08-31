namespace Asala.Core.Modules.Messages.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string DefaultText { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<MessageLocalizedDto> Localizations { get; set; } = [];
}

public class MessageLocalizedDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Text { get; set; } = null!;
    public int LanguageId { get; set; }
    public string LanguageName { get; set; } = null!;
    public string LanguageCode { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateMessageDto
{
    public string Key { get; set; } = null!;
    public string DefaultText { get; set; } = string.Empty;
    public List<CreateMessageLocalizedDto> Localizations { get; set; } = [];
}

public class CreateMessageLocalizedDto
{
    public string Key { get; set; } = null!;
    public string Text { get; set; } = null!;
    public int LanguageId { get; set; }
}

public class UpdateMessageDto
{
    public string Key { get; set; } = null!;
    public string DefaultText { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<UpdateMessageLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateMessageLocalizedDto
{
    public int? Id { get; set; } // Null for new translations
    public string Key { get; set; } = null!;
    public string Text { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; } = true;
}
