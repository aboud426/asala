using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Keyless]
[Table("Product_Post")]
public partial class ProductPost
{
    public int PostId { get; set; }

    [ForeignKey("PostId")]
    public virtual Post Post { get; set; } = null!;

    [ForeignKey("PostId")]
    public virtual ProductsPost PostNavigation { get; set; } = null!;
}
