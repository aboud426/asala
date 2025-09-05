namespace Asala.Core.Modules.Users.DTOs;

public enum ProviderSortBy
{
    Name,
    Rating
}

public class ProviderDto
{
    public int UserId { get; set; } // Primary Key
    public string? PhoneNumber { get; set; } // From User table
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public string? ParentBusinessName { get; set; }
    public bool IsActive { get; set; } // From User table
    public DateTime CreatedAt { get; set; } // From User table
    public DateTime UpdatedAt { get; set; } // From User table
    public List<ProviderLocalizedDto> Localizations { get; set; } = [];
}

public class CreateProviderDto
{
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!; // OTP for phone verification
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public int? LocationId { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateProviderLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateProviderDto
{
    public string? PhoneNumber { get; set; }
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public int? LocationId { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateProviderLocalizedDto> Localizations { get; set; } = [];
}

public class ProviderDropdownDto
{
    public int UserId { get; set; } // Primary Key
    public string BusinessName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
}

public class ProviderTreeDto
{
    public int UserId { get; set; } // Primary Key
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } // From User table
    public List<ProviderLocalizedDto> Localizations { get; set; } = [];
    public List<ProviderTreeDto> Children { get; set; } = new List<ProviderTreeDto>();
}
