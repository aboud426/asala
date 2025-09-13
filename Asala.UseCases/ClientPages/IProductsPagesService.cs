using Asala.Core.Common.Models;
using Asala.Core.Modules.ClientPages.DTOs;

namespace Asala.UseCases.ClientPages;

public interface IProductsPagesService
{
    Task<Result<PaginatedResult<ProductsPagesDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductsPagesDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductsPagesDto>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductsPagesDto>> CreateAsync(
        CreateProductsPagesDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductsPagesDto>> UpdateAsync(
        int id,
        UpdateProductsPagesDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<ProductsPagesDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );

    Task<Result> UpdateIncludedProductCategoriesAsync(
        int id,
        IEnumerable<int> productCategoryIds,
        CancellationToken cancellationToken = default
    );
}
