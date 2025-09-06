namespace Asala.Core.Modules.Users.Models;

public class Employee
{
    public int UserId { get; set; } // Primary Key - Foreign Key to User.Id
    public User User { get; set; } = null!;
    public string EmployeeName { get; set; } = null!;
    public bool IsDeleted { get; set; } = false;
}
