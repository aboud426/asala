using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Table("Message")]
public partial class Message : BaseEntity<int>
{
    [StringLength(100)]
    public string Code { get; set; } = null!;

    [InverseProperty("Message")]
    public virtual ICollection<MessageLocalized> MessageLocalizeds { get; set; } = new List<MessageLocalized>();
}