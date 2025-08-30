using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Category")]
public partial class Category : BaseEntity<int>
{

    [StringLength(50)]
    public string Name { get; set; } = null!;

    public int? ParentId { get; set; }

    public bool IsActive { get; set; } = true;

    [InverseProperty("Category")]
    public virtual ICollection<CategoryLocalized> CategoryLocalizeds { get; set; } = new List<CategoryLocalized>();

    [InverseProperty("Parent")]
    public virtual ICollection<Category> InverseParent { get; set; } = new List<Category>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Category? Parent { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<ProviderCategory> ProviderCategories { get; set; } = new List<ProviderCategory>();
}
