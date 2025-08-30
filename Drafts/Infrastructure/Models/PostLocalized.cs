using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Post_Localized")]
public partial class PostLocalized : BaseEntity<int>
{

    [Column("Description_Localized")]
    [StringLength(500)]
    public string DescriptionLocalized { get; set; } = null!;

    [Column("Language_Id")]
    public int LanguageId { get; set; }

    [Column("Post_Id")]
    public int PostId { get; set; }

    [ForeignKey("LanguageId")]
    [InverseProperty("PostLocalizeds")]
    public virtual Language Language { get; set; } = null!;

    [ForeignKey("PostId")]
    [InverseProperty("PostLocalizeds")]
    public virtual Post Post { get; set; } = null!;
}
