using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("ProductCategory")]
public partial class ProductCategory
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public int? ParentId { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<ProductCategory> InverseParent { get; set; } = new List<ProductCategory>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual ProductCategory? Parent { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<ProductCategoryLocalized> ProductCategoryLocalizeds { get; set; } = new List<ProductCategoryLocalized>();

    [InverseProperty("Category")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
