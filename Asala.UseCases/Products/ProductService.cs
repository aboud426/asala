using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Posts.DTOs;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Media.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Db;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IProductLocalizedRepository _productLocalizedRepository;
    private readonly IProductMediaRepository _productMediaRepository;
    private readonly IProductsPostRepository _productsPostRepository;
    private readonly IPostRepository _postRepository;
    private readonly IPostMediaRepository _postMediaRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AsalaDbContext _context;

    public ProductService(
        IProductRepository productRepository,
        IProductLocalizedRepository productLocalizedRepository,
        IProductMediaRepository productMediaRepository,
        IProductsPostRepository productsPostRepository,
        IPostRepository postRepository,
        IPostMediaRepository postMediaRepository,
        ILanguageRepository languageRepository,
        IUnitOfWork unitOfWork,
        AsalaDbContext context)
    {
        _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        _productLocalizedRepository = productLocalizedRepository ?? throw new ArgumentNullException(nameof(productLocalizedRepository));
        _productMediaRepository = productMediaRepository ?? throw new ArgumentNullException(nameof(productMediaRepository));
        _productsPostRepository = productsPostRepository ?? throw new ArgumentNullException(nameof(productsPostRepository));
        _postRepository = postRepository ?? throw new ArgumentNullException(nameof(postRepository));
        _postMediaRepository = postMediaRepository ?? throw new ArgumentNullException(nameof(postMediaRepository));
        _languageRepository = languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Result<ProductDto?>> CreateWithMediaAsync(CreateProductWithMediaDto createDto, CancellationToken cancellationToken = default)
    {
        // Validation
        var validationResult = ValidateCreateProductWithMediaDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProductDto?>(validationResult.MessageCode);

        // Create product
        var product = new Product
        {
            Name = createDto.Name.Trim(),
            CategoryId = createDto.CategoryId,
            ProviderId = createDto.ProviderId,
            Price = createDto.Price,
            Quantity = createDto.Quantity,
            Description = createDto.Description?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var addProductResult = await _productRepository.AddAsync(product, cancellationToken);
        if (addProductResult.IsFailure)
            return Result.Failure<ProductDto?>(addProductResult.MessageCode);

        // Create media entries and link to product
        if (createDto.MediaUrls.Any())
        {
            foreach (var mediaUrl in createDto.MediaUrls.Where(url => !string.IsNullOrWhiteSpace(url)))
            {
                // Create media entry
                var media = new Media
                {
                    MediaTypeId = 1, // Default media type
                    Url = mediaUrl.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Medias.Add(media);
                await _context.SaveChangesAsync(cancellationToken);

                // Link media to product
                var productMedia = new ProductMedia
                {
                    ProductId = addProductResult.Value.Id,
                    MediaId = media.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _productMediaRepository.AddAsync(productMedia, cancellationToken);
            }
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProductDto?>(saveResult.MessageCode);

        var dto = MapToDto(addProductResult.Value);
        return Result.Success<ProductDto?>(dto);
    }

    public async Task<Result<PostDto?>> CreateProductPostAsync(CreateProductPostDto createDto, int userId, CancellationToken cancellationToken = default)
    {
        // Validation
        if (!createDto.ProductIds.Any())
            return Result.Failure<PostDto?>(MessageCodes.PRODUCT_ID_INVALID);

        // Verify all products exist
        foreach (var productId in createDto.ProductIds)
        {
            var productResult = await _productRepository.GetByIdAsync(productId, cancellationToken);
            if (productResult.IsFailure || productResult.Value == null)
                return Result.Failure<PostDto?>(MessageCodes.PRODUCT_NOT_FOUND);
        }

        // Create post
        var post = new Post
        {
            UserId = userId,
            Description = createDto.PostDescription?.Trim(),
            NumberOfReactions = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var addPostResult = await _postRepository.AddAsync(post, cancellationToken);
        if (addPostResult.IsFailure)
            return Result.Failure<PostDto?>(addPostResult.MessageCode);

        // Link products to post
        foreach (var productId in createDto.ProductIds)
        {
            var productsPost = new ProductsPost
            {
                PostId = addPostResult.Value.Id,
                ProductId = productId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _productsPostRepository.AddAsync(productsPost, cancellationToken);
        }

        // Create media entries and link to post
        if (createDto.MediaUrls.Any())
        {
            foreach (var mediaUrl in createDto.MediaUrls.Where(url => !string.IsNullOrWhiteSpace(url)))
            {
                // Create media entry
                var media = new Media
                {
                    MediaTypeId = 1, // Default media type
                    Url = mediaUrl.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Medias.Add(media);
                await _context.SaveChangesAsync(cancellationToken);

                // Link media to post
                var postMedia = new PostMedia
                {
                    PostId = addPostResult.Value.Id,
                    MediaId = media.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _postMediaRepository.AddAsync(postMedia, cancellationToken);
            }
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostDto?>(saveResult.MessageCode);

        var postDto = new PostDto
        {
            Id = addPostResult.Value.Id,
            UserId = addPostResult.Value.UserId,
            Description = addPostResult.Value.Description,
            NumberOfReactions = addPostResult.Value.NumberOfReactions,
            IsActive = addPostResult.Value.IsActive,
            CreatedAt = addPostResult.Value.CreatedAt,
            UpdatedAt = addPostResult.Value.UpdatedAt
        };

        return Result.Success<PostDto?>(postDto);
    }

    public async Task<Result<PaginatedResult<ProductDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        // Get language by code
        var languageResult = await _languageRepository.GetFirstOrDefaultAsync(
            filter: l => l.Code == languageCode && l.IsActive && !l.IsDeleted);
        if (languageResult.IsFailure || languageResult.Value == null)
            return Result.Failure<PaginatedResult<ProductDto>>(MessageCodes.LANGUAGE_NOT_FOUND);

        var language = languageResult.Value;

        // Build filter
        Expression<Func<Product, bool>> filter = activeOnly switch
        {
            true => p => p.IsActive && !p.IsDeleted,
            false => p => !p.IsActive && !p.IsDeleted,
            null => p => !p.IsDeleted,
        };

        // Get paginated products
        var productsResult = await _productRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter,
            orderBy: q => q.OrderByDescending(p => p.CreatedAt)
        );

        if (productsResult.IsFailure)
            return Result.Failure<PaginatedResult<ProductDto>>(productsResult.MessageCode);

        // Get localized data for these products
        var productIds = productsResult.Value.Items.Select(p => p.Id).ToList();
        var localizedProducts = await _context.ProductLocalizeds
            .Where(pl => productIds.Contains(pl.ProductId) && pl.LanguageId == language.Id && !pl.IsDeleted)
            .ToListAsync(cancellationToken);

        // Map to DTOs with localization
        var dtos = productsResult.Value.Items.Select(product =>
        {
            var localized = localizedProducts.FirstOrDefault(pl => pl.ProductId == product.Id);
            return MapToDtoWithLocalization(product, localized);
        }).ToList();

        var paginatedDto = new PaginatedResult<ProductDto>(
            items: dtos,
            totalCount: productsResult.Value.TotalCount,
            page: productsResult.Value.Page,
            pageSize: productsResult.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            CategoryId = product.CategoryId,
            ProviderId = product.ProviderId,
            Price = product.Price,
            Quantity = product.Quantity,
            Description = product.Description,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    private static Result ValidateCreateProductWithMediaDto(CreateProductWithMediaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return Result.Failure(MessageCodes.PRODUCT_NAME_REQUIRED);

        if (dto.Name.Length > 10)
            return Result.Failure(MessageCodes.PRODUCT_NAME_TOO_LONG);

        if (dto.CategoryId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_CATEGORY_ID_REQUIRED);

        if (dto.ProviderId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_PROVIDER_ID_REQUIRED);

        if (dto.Price < 0)
            return Result.Failure(MessageCodes.PRODUCT_PRICE_INVALID);

        if (dto.Quantity < 0)
            return Result.Failure(MessageCodes.PRODUCT_QUANTITY_INVALID);

        return Result.Success();
    }

    private static ProductDto MapToDtoWithLocalization(Product product, ProductLocalized? localized)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            LocalizedName = localized?.NameLocalized,
            CategoryId = product.CategoryId,
            ProviderId = product.ProviderId,
            Price = product.Price,
            Quantity = product.Quantity,
            Description = product.Description,
            LocalizedDescription = localized?.DescriptionLocalized,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}