using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;

namespace Asala.UseCases.Categories;

public interface ICategoryService
{
    Task<Result<PaginatedResult<CategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<CategoryDto>> CreateAsync(
        CreateCategoryDto createDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<CategoryDto?>> UpdateAsync(
        int id,
        UpdateCategoryDto updateDto,
        CancellationToken cancellationToken = default
    );
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<CategoryDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<CategoryDto>>> GetSubcategoriesAsync(
        int parentId,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<CategoryTreeDto>>> GetCategoryTreeAsync(
        int? rootId = null,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<int>>> GetCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
    Task<Result<CategoryDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
