namespace Asala.Core.Modules.Users.DTOs;

public class EmployeeDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEmployeeDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int? LocationId { get; set; }
}

public class UpdateEmployeeDto
{
    public string Email { get; set; } = null!;
    public int? LocationId { get; set; }
    public bool IsActive { get; set; }
}

public class EmployeeDropdownDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
}
