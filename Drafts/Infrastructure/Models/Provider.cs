using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Provider")]
public partial class Provider
{
    [Key]
    public int UserId { get; set; }

    [StringLength(50)]
    public string BusinessName { get; set; } = null!;

    public int Rating { get; set; }

    public int? ParentId { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<Provider> InverseParent { get; set; } = new List<Provider>();

    [InverseProperty("Provider")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Provider? Parent { get; set; }

    [InverseProperty("Provider")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    [InverseProperty("Provider")]
    public virtual ICollection<ProviderCategory> ProviderCategories { get; set; } = new List<ProviderCategory>();

    [ForeignKey("UserId")]
    [InverseProperty("Provider")]
    public virtual User User { get; set; } = null!;
}
