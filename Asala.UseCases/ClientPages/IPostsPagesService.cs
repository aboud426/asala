using Asala.Core.Common.Models;
using Asala.Core.Modules.ClientPages.DTOs;

namespace Asala.UseCases.ClientPages;

public interface IPostsPagesService
{
    Task<Result<PaginatedResult<PostsPagesDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostsPagesDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<PostsPagesDto>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostsPagesDto>> CreateAsync(
        CreatePostsPagesDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostsPagesDto>> UpdateAsync(
        int id,
        UpdatePostsPagesDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<PostsPagesDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );

    Task<Result> UpdateIncludedPostTypesAsync(
        int id,
        IEnumerable<int> postTypeIds,
        CancellationToken cancellationToken = default
    );
}
