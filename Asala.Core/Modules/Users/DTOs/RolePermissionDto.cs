namespace Asala.Core.Modules.Users.DTOs;

public class RolePermissionDto
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
    public string RoleName { get; set; } = null!;
    public string PermissionName { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateRolePermissionDto
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
}

public class UpdateRolePermissionDto
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
    public bool IsActive { get; set; }
}

public class RolePermissionDropdownDto
{
    public int Id { get; set; }
    public string RoleName { get; set; } = null!;
    public string PermissionName { get; set; } = null!;
}
