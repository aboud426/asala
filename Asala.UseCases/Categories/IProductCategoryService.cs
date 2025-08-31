using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;

namespace Asala.UseCases.Categories;

public interface IProductCategoryService
{
    Task<Result<PaginatedResult<ProductCategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<ProductCategoryDto>> CreateAsync(
        CreateProductCategoryDto createDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<ProductCategoryDto?>> UpdateAsync(
        int id,
        UpdateProductCategoryDto updateDto,
        CancellationToken cancellationToken = default
    );
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ProductCategoryDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a product category by id with all its localizations
    /// </summary>
    Task<Result<ProductCategoryDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets product category IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetProductCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
