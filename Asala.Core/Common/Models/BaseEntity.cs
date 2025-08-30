using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Asala.Core.Common.Models;

public abstract class BaseEntity<T>
{
    [Key]
    public T Id { get; set; } = default!;

    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime UpdatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DeletedAt { get; set; }
}
