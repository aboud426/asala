using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Media.Models;

public class MediaType : BaseEntity<int>
{
    public string Name { get; set; } = null!;
}
