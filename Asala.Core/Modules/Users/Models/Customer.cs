namespace Asala.Core.Modules.Users.Models;

public class Customer
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
