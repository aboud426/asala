namespace Asala.Core.Modules.Posts.DTOs;

public class PostDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Description { get; set; }
    public string? LocalizedDescription { get; set; }
    public int? NumberOfReactions { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostDto
{
    public int UserId { get; set; }
    public string? Description { get; set; }
    public int? NumberOfReactions { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePostDto
{
    public string? Description { get; set; }
    public int? NumberOfReactions { get; set; }
    public bool IsActive { get; set; }
}

public class PostDropdownDto
{
    public int Id { get; set; }
    public string? Description { get; set; }
    public int UserId { get; set; }
}
