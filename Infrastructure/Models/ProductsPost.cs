using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Products_Post")]
public partial class ProductsPost
{
    [Key]
    public int Id { get; set; }

    public int PostId { get; set; }

    public int ProductId { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("ProductsPosts")]
    public virtual Product Product { get; set; } = null!;
}
