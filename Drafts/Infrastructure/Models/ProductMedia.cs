using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Product_Medias")]
public partial class ProductMedia : BaseEntity<int>
{

    [Column("Product_Id")]
    public int ProductId { get; set; }

    [Column("Media_Id")]
    public int MediaId { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("ProductMedia")]
    public virtual Medium Media { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("ProductMedia")]
    public virtual Product Product { get; set; } = null!;
}
