using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.DTOs;

namespace Asala.UseCases.Posts;

public interface IPostService
{
    Task<Result<PostDto?>> CreateWithMediaAsync(
        CreatePostWithMediaDto createDto,
        int userId,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<PostDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
