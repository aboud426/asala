using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Product_Localized")]
public partial class ProductLocalized
{
    [Key]
    public int Id { get; set; }

    [Column("Language_Id")]
    public int LanguageId { get; set; }

    [Column("Name_Localized")]
    [StringLength(10)]
    public string NameLocalized { get; set; } = null!;

    [Column("Description_Localized")]
    [StringLength(500)]
    public string? DescriptionLocalized { get; set; }

    [Column("Product_Id")]
    public int ProductId { get; set; }

    [ForeignKey("LanguageId")]
    [InverseProperty("ProductLocalizeds")]
    public virtual Language Language { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("ProductLocalizeds")]
    public virtual Product Product { get; set; } = null!;
}
