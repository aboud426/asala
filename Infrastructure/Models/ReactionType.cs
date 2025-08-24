using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("ReactionType")]
public partial class ReactionType
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string Name { get; set; } = null!;

    [InverseProperty("ReactionType")]
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}
