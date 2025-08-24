using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Product")]
public partial class Product
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string Name { get; set; } = null!;

    public int CategoryId { get; set; }

    public int ProviderId { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; }

    public int Quantity { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [InverseProperty("Product")]
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    [ForeignKey("CategoryId")]
    [InverseProperty("Products")]
    public virtual ProductCategory Category { get; set; } = null!;

    [InverseProperty("Product")]
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    [InverseProperty("Product")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [InverseProperty("Product")]
    public virtual ICollection<ProductLocalized> ProductLocalizeds { get; set; } = new List<ProductLocalized>();

    [InverseProperty("Product")]
    public virtual ICollection<ProductMedia> ProductMedia { get; set; } = new List<ProductMedia>();

    [InverseProperty("Product")]
    public virtual ICollection<ProductsPost> ProductsPosts { get; set; } = new List<ProductsPost>();

    [ForeignKey("ProviderId")]
    [InverseProperty("Products")]
    public virtual Provider Provider { get; set; } = null!;
}
