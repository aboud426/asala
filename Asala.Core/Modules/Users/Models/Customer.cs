namespace Asala.Core.Modules.Users.Models;

public class Customer
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public int AddressId { get; set; }

}
