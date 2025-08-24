using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Order_Item")]
public partial class OrderItem
{
    [Key]
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int? PostId { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; }

    public int ProviderId { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderItems")]
    public virtual Order Order { get; set; } = null!;

    [InverseProperty("OrderItem")]
    public virtual ICollection<OrderItemActivity> OrderItemActivities { get; set; } = new List<OrderItemActivity>();

    [ForeignKey("PostId")]
    [InverseProperty("OrderItems")]
    public virtual Post? Post { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("OrderItems")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("ProviderId")]
    [InverseProperty("OrderItems")]
    public virtual Provider Provider { get; set; } = null!;
}
