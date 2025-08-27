using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("OrderItemActivity")]
public partial class OrderItemActivity : BaseEntity<int>
{
    public int OrderItemStatusId { get; set; }

    public int OrderItemId { get; set; }

    [ForeignKey("OrderItemId")]
    [InverseProperty("OrderItemActivities")]
    public virtual OrderItem OrderItem { get; set; } = null!;

    [ForeignKey("OrderItemStatusId")]
    [InverseProperty("OrderItemActivities")]
    public virtual OrderItemStatus OrderItemStatus { get; set; } = null!;
}
