using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Location_Localized")]
public partial class LocationLocalized
{
    [Key]
    public int Id { get; set; }

    public int LocationId { get; set; }

    [StringLength(50)]
    public string LocalizedName { get; set; } = null!;

    public int LanguageId { get; set; }

    [ForeignKey("LanguageId")]
    [InverseProperty("LocationLocalizeds")]
    public virtual Language Language { get; set; } = null!;

    [ForeignKey("LocationId")]
    [InverseProperty("LocationLocalizeds")]
    public virtual Location Location { get; set; } = null!;
}
