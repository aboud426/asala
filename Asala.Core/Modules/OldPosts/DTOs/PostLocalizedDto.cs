namespace Asala.Core.Modules.Posts.DTOs;

public class PostLocalizedDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string LanguageName { get; set; } = string.Empty;
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostLocalizedDto
{
    public int LanguageId { get; set; }
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}

public class UpdatePostLocalizedDto
{
    public int? Id { get; set; }
    public int LanguageId { get; set; }
    public string DescriptionLocalized { get; set; } = null!;
    public bool IsActive { get; set; }
}
