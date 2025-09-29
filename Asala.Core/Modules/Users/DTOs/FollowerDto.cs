namespace Asala.Core.Modules.Users.DTOs;

public class FollowerDto
{
    public int Id { get; set; }
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
    public string FollowerName { get; set; } = string.Empty;
    public string FollowingName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FollowUserResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public FollowerDto? Data { get; set; }
}
