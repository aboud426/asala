namespace Asala.Core.Modules.Users.DTOs;

public enum EmployeeSortBy
{
    Name
}

public class EmployeeDto
{
    public int UserId { get; set; } // Primary Key
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!; // From User table
    public bool IsActive { get; set; } // From User table
    public DateTime CreatedAt { get; set; } // From User table
    public DateTime UpdatedAt { get; set; } // From User table
}

public class CreateEmployeeDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int? LocationId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateEmployeeDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int? LocationId { get; set; }
    public bool IsActive { get; set; }
}

public class EmployeeDropdownDto
{
    public int UserId { get; set; } // Primary Key
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}
