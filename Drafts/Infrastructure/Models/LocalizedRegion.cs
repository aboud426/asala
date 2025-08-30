using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("LocalizedRegion")]
public partial class LocalizedRegion : BaseEntity<int>
{

    public int RegionId { get; set; }

    public int LanguageId { get; set; }

    [StringLength(50)]
    public string LocalizedName { get; set; } = null!;

    [ForeignKey("LanguageId")]
    [InverseProperty("LocalizedRegions")]
    public virtual Language Language { get; set; } = null!;

    [ForeignKey("RegionId")]
    [InverseProperty("LocalizedRegions")]
    public virtual Region Region { get; set; } = null!;
}
