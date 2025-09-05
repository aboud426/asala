namespace Asala.Core.Modules.Users.Models;

public class Provider
{
    public int UserId { get; set; } // Primary Key - Foreign Key to User.Id
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }
}
