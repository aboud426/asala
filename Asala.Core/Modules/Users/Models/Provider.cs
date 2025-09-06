using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Users.Models;

public class Provider
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Rating { get; set; } = 3;
    public int? ParentId { get; set; }
    public Provider? Parent { get; set; }
    public List<ProviderLocalized> ProviderLocalizeds = [];
    public List<Provider> ChildrenProviders = [];
    public List<ProviderMedia> ProviderMedias = [];
}

public class ProviderMedia : BaseEntity<int>
{
    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public string Url { get; set; } = null!;
    public MediaTypeEnum MediaType { get; set; } = MediaTypeEnum.Image;
}

public enum MediaTypeEnum
{
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    Other = 5,
}
