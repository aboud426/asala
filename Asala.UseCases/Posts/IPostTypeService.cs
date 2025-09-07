using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.DTOs;

namespace Asala.UseCases.Posts;

public interface IPostTypeService
{
    Task<Result<PaginatedResult<PostTypeDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostTypeDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<PostTypeDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostTypeDto>> CreateAsync(
        CreatePostTypeDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostTypeDto?>> UpdateAsync(
        int id,
        UpdatePostTypeDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<int>>> GetPostTypesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
