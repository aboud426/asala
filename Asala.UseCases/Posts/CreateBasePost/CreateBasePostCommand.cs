using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using MediatR;

namespace Asala.UseCases.Posts.CreateBasePost;

public class CreateBasePostCommand : IRequest<Result<BasePostDto>>
{
    public int UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int PostTypeId { get; set; }
    public List<CreateBasePostMediaDto> MediaUrls { get; set; } = new();
    public List<CreateBasePostLocalizedDto> Localizations { get; set; } = new();
}

public class CreateBasePostMediaDto
{
    public string Url { get; set; } = string.Empty;
    public MediaType MediaType { get; set; } = MediaType.Other;
    public int DisplayOrder { get; set; } = 0;
}

public class CreateBasePostLocalizedDto
{
    public int LanguageId { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class BasePostDto
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int NumberOfReactions { get; set; }
    public int PostTypeId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<BasePostMediaDto> PostMedias { get; set; } = new();
    public List<BasePostLocalizedDto> Localizations { get; set; } = new();
}

public class BasePostMediaDto
{
    public long Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public required int DisplayOrder { get; set; } = 0;
}

public class BasePostLocalizedDto
{
    public long Id { get; set; }
    public int LanguageId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string LanguageName { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
}
