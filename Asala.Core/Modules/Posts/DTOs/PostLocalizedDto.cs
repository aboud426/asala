namespace Asala.Core.Modules.Posts.DTOs;

public class PostLocalizedDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int LanguageId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostLocalizedDto
{
    public int PostId { get; set; }
    public int LanguageId { get; set; }
    public string DescriptionLocalized { get; set; } = null!;
}

public class UpdatePostLocalizedDto
{
    public string DescriptionLocalized { get; set; } = null!;
}
