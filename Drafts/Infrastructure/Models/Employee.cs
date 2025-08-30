using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Employee")]
public partial class Employee
{
    [Key]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Employee")]
    public virtual User User { get; set; } = null!;
}
