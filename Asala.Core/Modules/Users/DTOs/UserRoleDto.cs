namespace Asala.Core.Modules.Users.DTOs;

public class UserRoleDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public string UserEmail { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateUserRoleDto
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
}

public class UpdateUserRoleDto
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public bool IsActive { get; set; }
}

public class UserRoleDropdownDto
{
    public int Id { get; set; }
    public string UserEmail { get; set; } = null!;
    public string RoleName { get; set; } = null!;
}
