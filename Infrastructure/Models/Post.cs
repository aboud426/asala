using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Post")]
public partial class Post : BaseEntity<int>
{
    public int UserId { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public int? NumberOfReactions { get; set; }

    [InverseProperty("Post")]
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    [InverseProperty("Post")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [InverseProperty("Post")]
    public virtual ICollection<PostLocalized> PostLocalizeds { get; set; } = new List<PostLocalized>();

    [InverseProperty("Post")]
    public virtual ICollection<PostMedia> PostMedia { get; set; } = new List<PostMedia>();

    [InverseProperty("Post")]
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    [InverseProperty("Post")]
    public virtual Story? Story { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Posts")]
    public virtual User User { get; set; } = null!;
}
