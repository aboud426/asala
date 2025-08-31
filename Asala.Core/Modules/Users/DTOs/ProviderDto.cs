namespace Asala.Core.Modules.Users.DTOs;

public class ProviderDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string BusinessName { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public string? ParentBusinessName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProviderDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string BusinessName { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public int? LocationId { get; set; }
}

public class UpdateProviderDto
{
    public string Email { get; set; } = null!;
    public string BusinessName { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public int? LocationId { get; set; }
    public bool IsActive { get; set; }
}

public class ProviderDropdownDto
{
    public int UserId { get; set; }
    public string BusinessName { get; set; } = null!;
    public string Email { get; set; } = null!;
}
