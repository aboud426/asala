using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Customer")]
public partial class Customer
{
    [Key]
    public int UserId { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    public int AddresId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Customer")]
    public virtual User User { get; set; } = null!;
}
