namespace Asala.Core.Modules.Posts.DTOs;

public class CreatePostWithMediaDto
{
    public int ProviderId { get; set; }
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new List<string>();
}
