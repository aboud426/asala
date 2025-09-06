using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Posts.DTOs;

namespace Asala.UseCases.Products;

public interface IProductService
{
    Task<Result<ProductDto?>> CreateWithMediaAsync(CreateProductWithMediaDto createDto, CancellationToken cancellationToken = default);
    
    Task<Result<PostDto?>> CreateProductPostAsync(CreateProductPostDto createDto, int userId, CancellationToken cancellationToken = default);
    
    Task<Result<PaginatedResult<ProductDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
