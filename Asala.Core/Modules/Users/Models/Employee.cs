namespace Asala.Core.Modules.Users.Models;

public class Employee
{
    public int UserId { get; set; } // Primary Key - Foreign Key to User.Id
    public string Name { get; set; } = null!;
}
