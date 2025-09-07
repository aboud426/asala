using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.DTOs;

namespace Asala.UseCases.Posts;

public interface IPostService
{
    Task<Result<PaginatedResult<PostDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<PostDto>> CreateAsync(
        CreatePostDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostDto?>> UpdateAsync(
        int id,
        UpdatePostDto updateDto,
        CancellationToken cancellationToken = default
    );

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
