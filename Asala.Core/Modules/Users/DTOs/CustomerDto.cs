namespace Asala.Core.Modules.Users.DTOs;

public enum CustomerSortBy
{
    Name
}

public class CustomerDto
{
    public int UserId { get; set; } // Primary Key
    public string Name { get; set; } = null!;
    public int? AddressId { get; set; }
    public string Email { get; set; } = null!; // From User table
    public bool IsActive { get; set; } // From User table
    public DateTime CreatedAt { get; set; } // From User table
    public DateTime UpdatedAt { get; set; } // From User table
}

public class CreateCustomerDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int? LocationId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCustomerDto
{
    public string Name { get; set; } = null!;
    public int? AddressId { get; set; }
    public string Email { get; set; } = null!;
    public int? LocationId { get; set; }
    public bool IsActive { get; set; }
}

public class CustomerDropdownDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}
