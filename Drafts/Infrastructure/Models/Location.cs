using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Location")]
public partial class Location : BaseEntity<int>
{

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column(TypeName = "decimal(9, 6)")]
    public decimal Latitude { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal Longitude { get; set; }

    public int? RegionId { get; set; }

    [InverseProperty("Location")]
    public virtual ICollection<LocationLocalized> LocationLocalizeds { get; set; } = new List<LocationLocalized>();

    [InverseProperty("ShippingAddress")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [ForeignKey("RegionId")]
    [InverseProperty("Locations")]
    public virtual Region? Region { get; set; }

    [InverseProperty("Location")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
