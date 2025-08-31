namespace Asala.Core.Modules.Users.DTOs;

public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePermissionDto
{
    public string Name { get; set; } = null!;
}

public class UpdatePermissionDto
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class PermissionDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
