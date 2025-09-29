using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Users.Models;

public class User : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public bool EmailConfirmed { get; set; } = false;
    public bool PhoneNumberConfirmed { get; set; } = false;
    public int FollowersCount { get; set; } = 0;
    public int FollowingCount { get; set; } = 0;
    public int NumberOfLikes { get; set; } = 0;

    // Navigation properties
    public Provider? Provider { get; set; }
    public Employee? Employee { get; set; }
    public Customer? Customer { get; set; }
}

public enum OtpPurpose
{
    Register,
    Login,
    ForgotPassword,
}

public class UserOtps : BaseEntity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Otp { get; set; } = null!;
    public DateTime ExpirationTime { get; set; }
    public OtpPurpose Purpose { get; set; } = OtpPurpose.Register;
    public bool IsUsed { get; set; }
    public bool IsRevoked { get; set; }
}

public class UserFailedLoginAttempts : BaseEntity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime AttemptTime { get; set; }
    public LoginType LoginType { get; set; }
}

public enum LoginType
{
    Register,
    Login,
    ForgotPassword,
    ResetPassword,
    VerifyPhoneNumber,
    VerifyEmail,
    VerifySocial,
}

public class UserTokens : BaseEntity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string TokenId { get; set; } = null!;
    public bool IsRevoked { get; set; } = false;
    public DateTime ExpiresAt { get; set; }
}

public class Follower : BaseEntity<int>
{
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
    
    // Navigation properties
    public User FollowerUser { get; set; } = null!;
    public User FollowingUser { get; set; } = null!;
}