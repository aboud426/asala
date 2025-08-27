using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Message_Localized")]
public partial class MessageLocalized : BaseEntity<int>
{
    public int MessageId { get; set; }

    public int LanguageId { get; set; }

    [StringLength(1000)]
    public string LocalizedText { get; set; } = null!;

    [ForeignKey("MessageId")]
    [InverseProperty("MessageLocalizeds")]
    public virtual Message Message { get; set; } = null!;

    [ForeignKey("LanguageId")]
    [InverseProperty("MessageLocalizeds")]
    public virtual Language Language { get; set; } = null!;
}