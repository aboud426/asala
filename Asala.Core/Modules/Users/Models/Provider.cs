namespace Asala.Core.Modules.Users.Models;

public class Provider
{
    public int UserId { get; set; }
    public string BusinessName { get; set; } = null!;
    public int Rating { get; set; }
    public int? ParentId { get; set; }

}
