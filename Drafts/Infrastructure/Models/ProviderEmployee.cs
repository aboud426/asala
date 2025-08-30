using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

[Keyless]
[Table("Provider_Employees")]
public partial class ProviderEmployee
{
    public int ProviderId { get; set; }

    public int EmployeeId { get; set; }

    [ForeignKey("EmployeeId")]
    public virtual Employee Employee { get; set; } = null!;

    [ForeignKey("ProviderId")]
    public virtual Provider Provider { get; set; } = null!;
}
