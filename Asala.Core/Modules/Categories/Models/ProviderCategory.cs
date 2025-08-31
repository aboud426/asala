using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class ProviderCategory : BaseEntity<int>
{
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public bool IsActive { get; set; } = true;
    
}
