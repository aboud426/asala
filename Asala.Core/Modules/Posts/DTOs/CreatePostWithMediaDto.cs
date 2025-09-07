namespace Asala.Core.Modules.Posts.DTOs;

public class CreatePostWithMediaDto
{
    public int ProviderId { get; set; }
    public string? Description { get; set; }
    public int PostTypeId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<string> MediaUrls { get; set; } = new List<string>();
    public List<CreatePostLocalizedDto> Localizations { get; set; } = new List<CreatePostLocalizedDto>();
}
