using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Story")]
public partial class Story
{
    [Key]
    public int PostId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ExipreDate { get; set; }

    [ForeignKey("PostId")]
    [InverseProperty("Story")]
    public virtual Post Post { get; set; } = null!;
}
