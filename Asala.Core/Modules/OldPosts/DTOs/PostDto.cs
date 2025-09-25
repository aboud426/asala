namespace Asala.Core.Modules.Posts.DTOs;

public class PostDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Description { get; set; } = null!;
    public int NumberOfReactions { get; set; }
    public int NumberOfComments { get; set; }
    public int PostTypeId { get; set; }
    public string PostTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<string> MediaUrls { get; set; } = [];
    public List<PostLocalizedDto> Localizations { get; set; } = [];
}

public class CreatePostDto
{
    public int UserId { get; set; }
    public string Description { get; set; } = null!;
    public int NumberOfReactions { get; set; } = 0;
    public int PostTypeId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<string> MediaUrls { get; set; } = [];
    public List<CreatePostLocalizedDto> Localizations { get; set; } = [];
}

public class UpdatePostDto
{
    public string Description { get; set; } = null!;
    public int PostTypeId { get; set; }
    public bool IsActive { get; set; }
    public List<string> MediaUrls { get; set; } = [];
    public List<UpdatePostLocalizedDto> Localizations { get; set; } = [];
}

public class PostDropdownDto
{
    public int Id { get; set; }
    public string? Description { get; set; }
    public int UserId { get; set; }
}
