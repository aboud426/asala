using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Models
{
    public abstract class BaseEntity<T>
    {
        [Key]
        public T Id { get; set; } = default!;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? DeletedAt { get; set; }
    }
}
