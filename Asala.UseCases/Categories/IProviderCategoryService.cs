using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;

namespace Asala.UseCases.Categories;

public interface IProviderCategoryService
{
    Task<Result<PaginatedResult<ProviderCategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<ProviderCategoryDto>> CreateAsync(
        CreateProviderCategoryDto createDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<ProviderCategoryDto?>> UpdateAsync(
        int id,
        UpdateProviderCategoryDto updateDto,
        CancellationToken cancellationToken = default
    );
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
}
