using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("User")]
public partial class User : BaseEntity<int>
{

    [StringLength(100)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [StringLength(200)]
    [Unicode(false)]
    public string PasswordHash { get; set; } = null!;

    public int? LocationId { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    [InverseProperty("User")]
    public virtual Customer? Customer { get; set; }

    [InverseProperty("User")]
    public virtual Employee? Employee { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    [InverseProperty("FollowerNavigation")]
    public virtual ICollection<Follower> FollowerFollowerNavigations { get; set; } = new List<Follower>();

    [InverseProperty("Following")]
    public virtual ICollection<Follower> FollowerFollowings { get; set; } = new List<Follower>();

    [ForeignKey("LocationId")]
    [InverseProperty("Users")]
    public virtual Location? Location { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [InverseProperty("User")]
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    [InverseProperty("User")]
    public virtual Provider? Provider { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    [InverseProperty("User")]
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
