using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Favorite")]
public partial class Favorite : BaseEntity<int>
{
    public int UserId { get; set; }

    public int ProductId { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("Favorites")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Favorites")]
    public virtual User User { get; set; } = null!;
}
