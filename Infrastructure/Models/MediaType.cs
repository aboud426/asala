using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Media_Type")]
public partial class MediaType
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string Name { get; set; } = null!;

    [InverseProperty("MediaType")]
    public virtual ICollection<Medium> Media { get; set; } = new List<Medium>();
}
