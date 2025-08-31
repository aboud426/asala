namespace Asala.Core.Modules.Users.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateRoleDto
{
    public string Name { get; set; } = null!;
}

public class UpdateRoleDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class RoleDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
