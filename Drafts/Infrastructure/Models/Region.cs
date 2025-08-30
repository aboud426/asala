using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Region")]
public partial class Region : BaseEntity<int>
{

    [StringLength(10)]
    public string Name { get; set; } = null!;

    public int? ParentId { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<Region> InverseParent { get; set; } = new List<Region>();

    [InverseProperty("Region")]
    public virtual ICollection<LocalizedRegion> LocalizedRegions { get; set; } = new List<LocalizedRegion>();

    [InverseProperty("Region")]
    public virtual ICollection<Location> Locations { get; set; } = new List<Location>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Region? Parent { get; set; }
}
