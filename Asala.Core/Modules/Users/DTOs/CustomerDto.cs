namespace Asala.Core.Modules.Users.DTOs;

public class CustomerDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public int AddressId { get; set; }
    public string Email { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCustomerDto
{
    public string Name { get; set; } = null!;
    public int AddressId { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class UpdateCustomerDto
{
    public string Name { get; set; } = null!;
    public int AddressId { get; set; }
    public string Email { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class CustomerDropdownDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}
