namespace Asala.Core.Modules.Users.DTOs;

/// <summary>
/// OTP (One-Time Password) data transfer object
/// </summary>
public class OtpDto
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string Code { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public string Purpose { get; set; } = null!;
    public int AttemptsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request for OTP generation
/// </summary>
public class RequestOtpDto
{
    /// <summary>
    /// Phone number to send OTP to
    /// </summary>
    public string PhoneNumber { get; set; } = null!;
    
    /// <summary>
    /// Purpose of OTP (Login, Registration)
    /// </summary>
    public string Purpose { get; set; } = null!;
}

public class VerifyOtpDto
{
    public string PhoneNumber { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Purpose { get; set; } = null!;
}

public class OtpResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public DateTime? ExpiresAt { get; set; }
}

// Updated login DTOs to use OTP instead of password
public class CustomerLoginOtpDto
{
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!;
}

public class ProviderLoginOtpDto
{
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!;
}

// Updated registration DTOs to remove password
public class CustomerRegisterOtpDto
{
    public string Name { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string OtpCode { get; set; } = null!; // OTP for phone verification
    public int? LocationId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ProviderRegisterOtpDto
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
