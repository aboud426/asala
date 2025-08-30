using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Reaction")]
public partial class Reaction : BaseEntity<long>
{
    public int UserId { get; set; }

    public int PostId { get; set; }

    public int ReactionTypeId { get; set; }

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
