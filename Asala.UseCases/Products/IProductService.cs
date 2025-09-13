using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.DTOs;
using Asala.Core.Modules.Products.DTOs;

namespace Asala.UseCases.Products;

public interface IProductService
{
    Task<Result<ProductDto?>> CreateWithMediaAsync(
        CreateProductWithMediaDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<ProductDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductDto?>> UpdateWithMediaAsync(
        int id,
        UpdateProductWithMediaDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProductDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    Task<Result<CursorPaginatedResult<ProductDto>>> GetProductsByPageWithCursorAsync(
        int productsPagesId,
        string languageCode,
        int? cursor = null,
        int pageSize = 10,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
