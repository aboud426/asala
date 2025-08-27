using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Category_Localized")]
public partial class CategoryLocalized : BaseEntity<int>
{

    public int CategoryId { get; set; }

    [StringLength(50)]
    public string LocalizedName { get; set; } = null!;

    public int LanguageId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("CategoryLocalizeds")]
    public virtual Category Category { get; set; } = null!;

    [ForeignKey("LanguageId")]
    [InverseProperty("CategoryLocalizeds")]
    public virtual Language Language { get; set; } = null!;
}
