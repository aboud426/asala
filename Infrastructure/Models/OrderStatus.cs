using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("OrderStatus")]
public partial class OrderStatus
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [InverseProperty("OrderStatus")]
    public virtual ICollection<OrderActivity> OrderActivities { get; set; } = new List<OrderActivity>();
}
