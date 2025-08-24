using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Reaction")]
public partial class Reaction
{
    [Key]
    public long Id { get; set; }

    public int UserId { get; set; }

    public int PostId { get; set; }

    public int ReactionTypeId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("PostId")]
    [InverseProperty("Reactions")]
    public virtual Post Post { get; set; } = null!;

    [ForeignKey("ReactionTypeId")]
    [InverseProperty("Reactions")]
    public virtual ReactionType ReactionType { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Reactions")]
    public virtual User User { get; set; } = null!;
}
