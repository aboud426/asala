namespace Asala.Core.Modules.Users.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }

    // public int? LocationId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateUserDto
{
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string Password { get; set; } = null!;
    // public int? LocationId { get; set; }
}

public class UpdateUserDto
{
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }

    // public int? LocationId { get; set; }
    public bool IsActive { get; set; }
}

public class UserDropdownDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class LoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class CustomerLoginDto
{
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!;
}

public class ProviderLoginDto
{
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!;
}

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public EmployeeUserDto User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

public class EmployeeUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
