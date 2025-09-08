namespace Asala.Core.Modules.Users.DTOs;

public enum CustomerSortBy
{
    Name,
}

public class CustomerDto
{
    public int UserId { get; set; } // Primary Key
    public string Name { get; set; } = null!;
    public string? PhoneNumber { get; set; } // From User table
    public bool IsActive { get; set; } // From User table
    public DateTime CreatedAt { get; set; } // From User table
    public DateTime UpdatedAt { get; set; } // From User table
}

public class CreateCustomerDto
{
    public string Name { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!; // OTP for phone verification
    public bool IsActive { get; set; } = true;
}

public class UpdateCustomerDto
{
    public string Name { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
}

public class CustomerDropdownDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public class CreateCustomerAdminDto
{
    public string Name { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}