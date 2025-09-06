using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Media.Models;

public class Media : BaseEntity<int>
{
    public int MediaTypeId { get; set; }
    public string Url { get; set; } = null!;
}
