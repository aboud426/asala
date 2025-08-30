using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("OrderItemStatus")]
public partial class OrderItemStatus : BaseEntity<int>
{

    [StringLength(20)]
    public string Name { get; set; } = null!;

    [InverseProperty("OrderItemStatus")]
    public virtual ICollection<OrderItemActivity> OrderItemActivities { get; set; } = new List<OrderItemActivity>();
}
