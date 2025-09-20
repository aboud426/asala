namespace Asala.Core.Modules.Posts.DTOs;

public class PostMediaDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int MediaId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostMediaDto
{
    public int PostId { get; set; }
    public int MediaId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePostMediaDto
{
    public int MediaId { get; set; }
    public bool IsActive { get; set; }
}
