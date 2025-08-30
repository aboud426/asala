using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("ProductCategory_Localized")]
public partial class ProductCategoryLocalized : BaseEntity<int>
{

    public int CategoryId { get; set; }

    [Column("Name_Localized")]
    [StringLength(10)]
    public string NameLocalized { get; set; } = null!;

    [Column("Decription_Localized")]
    [StringLength(500)]
    public string? DecriptionLocalized { get; set; }

    public int LanguageId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("ProductCategoryLocalizeds")]
    public virtual ProductCategory Category { get; set; } = null!;

    [ForeignKey("LanguageId")]
    [InverseProperty("ProductCategoryLocalizeds")]
    public virtual Language Language { get; set; } = null!;
}
