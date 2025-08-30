using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

public partial class Medium : BaseEntity<int>
{

    [Column("Media_Type_Id")]
    public int MediaTypeId { get; set; }

    [Column("URL")]
    [StringLength(500)]
    public string Url { get; set; } = null!;

    [ForeignKey("MediaTypeId")]
    [InverseProperty("Media")]
    public virtual MediaType MediaType { get; set; } = null!;

    [InverseProperty("Media")]
    public virtual ICollection<PostMedia> PostMedia { get; set; } = new List<PostMedia>();

    [InverseProperty("Media")]
    public virtual ICollection<ProductMedia> ProductMedia { get; set; } = new List<ProductMedia>();
}
