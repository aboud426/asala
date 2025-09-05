using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class Otp : BaseEntity<int>
{
    public string PhoneNumber { get; set; } = null!;
    public string Code { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public string Purpose { get; set; } = null!; // "Login", "Registration", etc.
    public int AttemptsCount { get; set; }
}
