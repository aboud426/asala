using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Users.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;

namespace Asala.UseCases.Posts.CreateNormalPost;

public class CreateNormalPostCommand : IRequest<Result<NormalPostDto>>
{
    public int UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int PostTypeId { get; set; }
    public List<CreateBasePostMediaDto> MediaUrls { get; set; } = new();
    public List<CreateBasePostLocalizedDto> Localizations { get; set; } = new();
}

public class NormalPostDto
{
    public long PostId { get; set; }
    public BasePostDto BasePost { get; set; } = null!;
}
