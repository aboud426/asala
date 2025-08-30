using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Language")]
public partial class Language : BaseEntity<int>
{

    [StringLength(20)]
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;

    [InverseProperty("Language")]
    public virtual ICollection<CategoryLocalized> CategoryLocalizeds { get; set; } = new List<CategoryLocalized>();

    [InverseProperty("Language")]
    public virtual ICollection<LocalizedRegion> LocalizedRegions { get; set; } = new List<LocalizedRegion>();

    [InverseProperty("Language")]
    public virtual ICollection<LocationLocalized> LocationLocalizeds { get; set; } = new List<LocationLocalized>();

    [InverseProperty("Language")]
    public virtual ICollection<PostLocalized> PostLocalizeds { get; set; } = new List<PostLocalized>();

    [InverseProperty("Language")]
    public virtual ICollection<ProductCategoryLocalized> ProductCategoryLocalizeds { get; set; } = new List<ProductCategoryLocalized>();

    [InverseProperty("Language")]
    public virtual ICollection<ProductLocalized> ProductLocalizeds { get; set; } = new List<ProductLocalized>();

    [InverseProperty("Language")]
    public virtual ICollection<MessageLocalized> MessageLocalizeds { get; set; } = new List<MessageLocalized>();
}
