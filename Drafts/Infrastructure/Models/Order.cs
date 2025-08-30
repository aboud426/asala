using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Order")]
public partial class Order : BaseEntity<int>
{
    public int UserId { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal TotalAmount { get; set; }

    public int ShippingAddressId { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderActivity> OrderActivities { get; set; } = new List<OrderActivity>();

    [InverseProperty("Order")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [ForeignKey("ShippingAddressId")]
    [InverseProperty("Orders")]
    public virtual Location ShippingAddress { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User User { get; set; } = null!;
}
