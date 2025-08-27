using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Follower")]
public partial class Follower : BaseEntity<int>
{
    public int FollowerId { get; set; }

    public int FollowingId { get; set; }

    [ForeignKey("FollowerId")]
    [InverseProperty("FollowerFollowerNavigations")]
    public virtual User FollowerNavigation { get; set; } = null!;

    [ForeignKey("FollowingId")]
    [InverseProperty("FollowerFollowings")]
    public virtual User Following { get; set; } = null!;
}
