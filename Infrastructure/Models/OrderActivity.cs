using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("OrderActivity")]
public partial class OrderActivity : BaseEntity<int>
{
    public int OrderStatusId { get; set; }

    public int OrderId { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderActivities")]
    public virtual Order Order { get; set; } = null!;

    [ForeignKey("OrderStatusId")]
    [InverseProperty("OrderActivities")]
    public virtual OrderStatus OrderStatus { get; set; } = null!;
}
