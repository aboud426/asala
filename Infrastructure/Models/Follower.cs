using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Follower")]
public partial class Follower
{
    [Key]
    public int Id { get; set; }

    public int FollowerId { get; set; }

    public int FollowingId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("FollowerId")]
    [InverseProperty("FollowerFollowerNavigations")]
    public virtual User FollowerNavigation { get; set; } = null!;

    [ForeignKey("FollowingId")]
    [InverseProperty("FollowerFollowings")]
    public virtual User Following { get; set; } = null!;
}
