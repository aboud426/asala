using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

public partial class ProviderCategory : BaseEntity<int>
{

    public int CategoryId { get; set; }

    public int ProviderId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("ProviderCategories")]
    public virtual Category Category { get; set; } = null!;

    [ForeignKey("ProviderId")]
    [InverseProperty("ProviderCategories")]
    public virtual Provider Provider { get; set; } = null!;
}
