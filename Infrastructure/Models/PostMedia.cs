using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Post_Medias")]
public partial class PostMedia
{
    [Key]
    public int Id { get; set; }

    [Column("Post_Id")]
    public int PostId { get; set; }

    [Column("Media_Id")]
    public int MediaId { get; set; }

    [ForeignKey("MediaId")]
    [InverseProperty("PostMedia")]
    public virtual Medium Media { get; set; } = null!;

    [ForeignKey("PostId")]
    [InverseProperty("PostMedia")]
    public virtual Post Post { get; set; } = null!;
}
