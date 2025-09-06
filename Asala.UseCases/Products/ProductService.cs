using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IProductLocalizedRepository _productLocalizedRepository;
    private readonly IProductMediaRepository _productMediaRepository;
    private readonly IProductCategoryRepository _productCategoryRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly ICurrencyRepository _currencyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(
        IProductRepository productRepository,
        IProductLocalizedRepository productLocalizedRepository,
        IProductMediaRepository productMediaRepository,
        IProductCategoryRepository productCategoryRepository,
        IProviderRepository providerRepository,
        ILanguageRepository languageRepository,
        ICurrencyRepository currencyRepository,
        IUnitOfWork unitOfWork
    )
    {
        _productRepository =
            productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        _productLocalizedRepository =
            productLocalizedRepository
            ?? throw new ArgumentNullException(nameof(productLocalizedRepository));
        _productMediaRepository =
            productMediaRepository
            ?? throw new ArgumentNullException(nameof(productMediaRepository));
        _productCategoryRepository =
            productCategoryRepository
            ?? throw new ArgumentNullException(nameof(productCategoryRepository));
        _providerRepository =
            providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _languageRepository =
            languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _currencyRepository =
            currencyRepository ?? throw new ArgumentNullException(nameof(currencyRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<ProductDto?>> CreateWithMediaAsync(
        CreateProductWithMediaDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<ProductDto?>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateCreateWithMediaDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProductDto?>(validationResult.MessageCode);

        // Validate that ProductCategory exists
        var categoryExistsResult = await _productCategoryRepository.AnyAsync(
            pc => pc.Id == createDto.CategoryId && pc.IsActive && !pc.IsDeleted,
            cancellationToken
        );
        if (categoryExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(categoryExistsResult.MessageCode);
        if (!categoryExistsResult.Value)
            return Result.Failure<ProductDto?>(MessageCodes.PRODUCT_CATEGORY_ID_REQUIRED);

        // Validate that Provider exists
        var providerExistsResult = await _providerRepository.AnyAsync(
            p => p.UserId == createDto.ProviderId,
            cancellationToken
        );
        if (providerExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(providerExistsResult.MessageCode);
        if (!providerExistsResult.Value)
            return Result.Failure<ProductDto?>(MessageCodes.PRODUCT_PROVIDER_ID_REQUIRED);

        // Validate that Currency exists
        var currencyExistsResult = await _currencyRepository.AnyAsync(
            c => c.Id == createDto.CurrencyId && c.IsActive && !c.IsDeleted,
            cancellationToken
        );
        if (currencyExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(currencyExistsResult.MessageCode);
        if (!currencyExistsResult.Value)
            return Result.Failure<ProductDto?>("Currency not found or inactive");

        // Begin transaction for creating Product with Media and Localizations
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<ProductDto?>(transactionResult.MessageCode);

        try
        {
            // Create Product
            var product = new Product
            {
                Name = createDto.Name.Trim(),
                Description = createDto.Description?.Trim(),
                CategoryId = createDto.CategoryId,
                ProviderId = createDto.ProviderId,
                Price = createDto.Price,
                Quantity = createDto.Quantity,
                CurrencyId = createDto.CurrencyId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var addProductResult = await _productRepository.AddAsync(product, cancellationToken);
            if (addProductResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(addProductResult.MessageCode);
            }

            var saveProductResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveProductResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(saveProductResult.MessageCode);
            }

            var createdProduct = addProductResult.Value!;

            // Create Product Media
            foreach (var mediaUrl in createDto.MediaUrls)
            {
                if (!string.IsNullOrWhiteSpace(mediaUrl))
                {
                    var productMedia = new ProductMedia
                    {
                        ProductId = createdProduct.Id,
                        Url = mediaUrl.Trim(),
                        MediaType = MediaTypeEnum.Image, // Default to Image, could be parameterized
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsActive = true,
                    };

                    var addMediaResult = await _productMediaRepository.AddAsync(
                        productMedia,
                        cancellationToken
                    );
                    if (addMediaResult.IsFailure)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return Result.Failure<ProductDto?>(addMediaResult.MessageCode);
                    }
                }
            }

            // Create Product Localizations
            foreach (var localizationDto in createDto.Localizeds)
            {
                // Validate that Language exists
                var languageExistsResult = await _languageRepository.AnyAsync(
                    l => l.Id == localizationDto.LanguageId && l.IsActive && !l.IsDeleted,
                    cancellationToken
                );
                if (languageExistsResult.IsFailure || !languageExistsResult.Value)
                    continue; // Skip invalid languages rather than failing the entire operation

                var productLocalized = new ProductLocalized
                {
                    ProductId = createdProduct.Id,
                    LanguageId = localizationDto.LanguageId,
                    NameLocalized = localizationDto.NameLocalized.Trim(),
                    DescriptionLocalized = localizationDto.DescriptionLocalized?.Trim(),
                    IsActive = localizationDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                var addLocalizedResult = await _productLocalizedRepository.AddAsync(
                    productLocalized,
                    cancellationToken
                );
                if (addLocalizedResult.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<ProductDto?>(addLocalizedResult.MessageCode);
                }
            }

            var saveFinalResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveFinalResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(saveFinalResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(commitResult.MessageCode);
            }

            // var dto = await MapToDtoAsync(createdProduct, cancellationToken);
            return Result.Success<ProductDto?>(new ProductDto { Id = createdProduct.Id });
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<PaginatedResult<ProductDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<ProductDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE
            );

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<ProductDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        if (string.IsNullOrWhiteSpace(languageCode))
            return Result.Failure<PaginatedResult<ProductDto>>("Language code is required");

        // Get the language by code
        var languageResult = await _languageRepository.GetFirstOrDefaultAsync(l =>
            l.Code == languageCode && l.IsActive && !l.IsDeleted
        );
        if (languageResult.IsFailure || languageResult.Value == null)
            return Result.Failure<PaginatedResult<ProductDto>>(MessageCodes.LANGUAGE_NOT_FOUND);

        var language = languageResult.Value;

        // Build query for products
        var productsQuery = _productRepository
            .GetQueryable()
            .Include(p => p.ProductCategory)
            .Include(p => p.Provider)
            .Include(p => p.Currency)
            .Include(p => p.ProductLocalizeds)
            .ThenInclude(pl => pl.Language)
            .Include(p => p.ProductMedias)
            .AsQueryable();

        // Apply active filter if specified
        if (activeOnly.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsActive == activeOnly.Value);
        }

        // Filter out deleted items
        productsQuery = productsQuery.Where(p => !p.IsDeleted);

        // Order by creation date (most recent first)
        productsQuery = productsQuery.OrderByDescending(p => p.CreatedAt);

        // Get total count
        var totalCount = await productsQuery.CountAsync(cancellationToken);

        // Apply pagination
        var products = await productsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var productDtos = new List<ProductDto>();
        foreach (var product in products)
        {
            var dto = await MapToLocalizedDtoAsync(product, language, cancellationToken);
            productDtos.Add(dto);
        }

        var paginatedResult = new PaginatedResult<ProductDto>(
            productDtos,
            totalCount,
            page,
            pageSize
        );

        return Result.Success(paginatedResult);
    }

    private async Task<ProductDto> MapToDtoAsync(
        Product product,
        CancellationToken cancellationToken = default
    )
    {
        // Load related entities if not already loaded
        var productWithIncludes = product;

        return new ProductDto
        {
            Id = productWithIncludes.Id,
            Name = productWithIncludes.Name,
            Description = productWithIncludes.Description,
            CategoryId = productWithIncludes.CategoryId,
            ProviderId = productWithIncludes.ProviderId,
            CategoryName = productWithIncludes.ProductCategory.Name,
            ProviderName = productWithIncludes.Provider.BusinessName,
            Price = productWithIncludes.Price,
            CurrencyId = productWithIncludes.CurrencyId,
            CurrencyName = productWithIncludes.Currency.Name,
            CurrencyCode = productWithIncludes.Currency.Code,
            CurrencySymbol = productWithIncludes.Currency.Symbol,
            Quantity = productWithIncludes.Quantity,
            IsActive = productWithIncludes.IsActive,
            CreatedAt = productWithIncludes.CreatedAt,
            UpdatedAt = productWithIncludes.UpdatedAt,
            Localizations = productWithIncludes
                .ProductLocalizeds.Where(pl => !pl.IsDeleted)
                .Select(pl => new ProductLocalizedDto
                {
                    Id = pl.Id,
                    ProductId = pl.ProductId,
                    LanguageId = pl.LanguageId,
                    LanguageCode = pl.Language.Code,
                    LanguageName = pl.Language.Name,
                    NameLocalized = pl.NameLocalized,
                    DescriptionLocalized = pl.DescriptionLocalized,
                    IsActive = pl.IsActive,
                    CreatedAt = pl.CreatedAt,
                    UpdatedAt = pl.UpdatedAt,
                })
                .ToList(),
            Images = productWithIncludes
                .ProductMedias.Where(pm => !pm.IsDeleted)
                .Select(pm => new ImageUrlDto { Url = pm.Url })
                .ToList(),
        };
    }

    private async Task<ProductDto> MapToLocalizedDtoAsync(
        Product product,
        Language language,
        CancellationToken cancellationToken = default
    )
    {
        var baseDto = await MapToDtoAsync(product, cancellationToken);

        // Find localization for the specified language
        var localization = product.ProductLocalizeds.FirstOrDefault(pl =>
            pl.LanguageId == language.Id && pl.IsActive && !pl.IsDeleted
        );

        if (localization != null)
        {
            baseDto.LocalizedName = localization.NameLocalized;
            baseDto.LocalizedDescription = localization.DescriptionLocalized;
        }

        return baseDto;
    }

    private Result ValidateCreateWithMediaDto(CreateProductWithMediaDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.PRODUCT_NAME_REQUIRED);

        if (createDto.Name.Length > 200)
            return Result.Failure(MessageCodes.PRODUCT_NAME_TOO_LONG);

        if (createDto.CategoryId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_CATEGORY_ID_REQUIRED);

        if (createDto.ProviderId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_PROVIDER_ID_REQUIRED);

        if (createDto.Price < 0)
            return Result.Failure(MessageCodes.PRODUCT_PRICE_INVALID);

        if (createDto.Quantity < 0)
            return Result.Failure(MessageCodes.PRODUCT_QUANTITY_INVALID);

        if (createDto.CurrencyId <= 0)
            return Result.Failure("Valid currency ID is required");

        // Validate localized data
        foreach (var localized in createDto.Localizeds)
        {
            if (string.IsNullOrWhiteSpace(localized.NameLocalized))
                return Result.Failure("Localized product name is required");

            if (localized.NameLocalized.Length > 200)
                return Result.Failure("Localized product name is too long");

            if (localized.LanguageId <= 0)
                return Result.Failure("Valid language ID is required for localization");
        }

        // Validate media URLs
        foreach (var mediaUrl in createDto.MediaUrls)
        {
            if (string.IsNullOrWhiteSpace(mediaUrl))
                continue;

            if (!Uri.IsWellFormedUriString(mediaUrl, UriKind.Absolute))
                return Result.Failure(MessageCodes.MEDIA_URL_INVALID);
        }

        return Result.Success();
    }

    public async Task<Result<ProductDto?>> UpdateWithMediaAsync(
        int id,
        UpdateProductWithMediaDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (updateDto == null)
            return Result.Failure<ProductDto?>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateUpdateWithMediaDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProductDto?>(validationResult.MessageCode);

        // Get existing product
        var productResult = await _productRepository.GetFirstOrDefaultAsync(p =>
            p.Id == id && !p.IsDeleted
        );
        if (productResult.IsFailure)
            return Result.Failure<ProductDto?>(productResult.MessageCode);
        if (productResult.Value == null)
            return Result.Failure<ProductDto?>("Product not found");

        var product = productResult.Value;

        // Validate that ProductCategory exists
        var categoryExistsResult = await _productCategoryRepository.AnyAsync(
            pc => pc.Id == updateDto.CategoryId && pc.IsActive && !pc.IsDeleted,
            cancellationToken
        );
        if (categoryExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(categoryExistsResult.MessageCode);
        if (!categoryExistsResult.Value)
            return Result.Failure<ProductDto?>(MessageCodes.PRODUCT_CATEGORY_ID_REQUIRED);

        // Validate that Provider exists
        var providerExistsResult = await _providerRepository.AnyAsync(
            p => p.UserId == updateDto.ProviderId,
            cancellationToken
        );
        if (providerExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(providerExistsResult.MessageCode);
        if (!providerExistsResult.Value)
            return Result.Failure<ProductDto?>(MessageCodes.PRODUCT_PROVIDER_ID_REQUIRED);

        // Validate that Currency exists
        var currencyExistsResult = await _currencyRepository.AnyAsync(
            c => c.Id == updateDto.CurrencyId && c.IsActive && !c.IsDeleted,
            cancellationToken
        );
        if (currencyExistsResult.IsFailure)
            return Result.Failure<ProductDto?>(currencyExistsResult.MessageCode);
        if (!currencyExistsResult.Value)
            return Result.Failure<ProductDto?>("Currency not found or inactive");

        // Begin transaction
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<ProductDto?>(transactionResult.MessageCode);

        try
        {
            // Update product properties
            product.Name = updateDto.Name.Trim();
            product.Description = updateDto.Description?.Trim();
            product.CategoryId = updateDto.CategoryId;
            product.ProviderId = updateDto.ProviderId;
            product.Price = updateDto.Price;
            product.Quantity = updateDto.Quantity;
            product.CurrencyId = updateDto.CurrencyId;
            product.IsActive = updateDto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            var updateProductResult = _productRepository.Update(product);
            if (updateProductResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(updateProductResult.MessageCode);
            }

            // Update Media: Remove existing and add new ones
            var existingMedia = await _productMediaRepository.GetAsync(pm =>
                pm.ProductId == id && !pm.IsDeleted
            );

            if (existingMedia.IsSuccess && existingMedia.Value != null)
            {
                foreach (var media in existingMedia.Value)
                {
                    media.IsDeleted = true;
                    media.UpdatedAt = DateTime.UtcNow;
                    _productMediaRepository.Update(media);
                }
            }

            // Create new Product Media
            foreach (var mediaUrl in updateDto.MediaUrls)
            {
                if (!string.IsNullOrWhiteSpace(mediaUrl))
                {
                    var productMedia = new ProductMedia
                    {
                        ProductId = id,
                        Url = mediaUrl.Trim(),
                        MediaType = MediaTypeEnum.Image,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsActive = true,
                    };

                    var addMediaResult = await _productMediaRepository.AddAsync(
                        productMedia,
                        cancellationToken
                    );
                    if (addMediaResult.IsFailure)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return Result.Failure<ProductDto?>(addMediaResult.MessageCode);
                    }
                }
            }

            // Update Product Localizations: Remove existing and add new ones
            var existingLocalizations = await _productLocalizedRepository.GetAsync(pl =>
                pl.ProductId == id && !pl.IsDeleted
            );

            if (existingLocalizations.IsSuccess && existingLocalizations.Value != null)
            {
                foreach (var localization in existingLocalizations.Value)
                {
                    localization.IsDeleted = true;
                    localization.UpdatedAt = DateTime.UtcNow;
                    _productLocalizedRepository.Update(localization);
                }
            }

            // Create new localizations
            foreach (var localizationDto in updateDto.Localizations)
            {
                // Validate that Language exists
                var languageExistsResult = await _languageRepository.AnyAsync(
                    l => l.Id == localizationDto.LanguageId && l.IsActive && !l.IsDeleted,
                    cancellationToken
                );
                if (languageExistsResult.IsFailure || !languageExistsResult.Value)
                    continue;

                var productLocalized = new ProductLocalized
                {
                    ProductId = id,
                    LanguageId = localizationDto.LanguageId,
                    NameLocalized = localizationDto.NameLocalized.Trim(),
                    DescriptionLocalized = localizationDto.DescriptionLocalized?.Trim(),
                    IsActive = localizationDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                var addLocalizedResult = await _productLocalizedRepository.AddAsync(
                    productLocalized,
                    cancellationToken
                );
                if (addLocalizedResult.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<ProductDto?>(addLocalizedResult.MessageCode);
                }
            }

            var saveFinalResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveFinalResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(saveFinalResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProductDto?>(commitResult.MessageCode);
            }

            var dto = await MapToDtoAsync(product, cancellationToken);
            return Result.Success<ProductDto?>(dto);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<ProductDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var productResult = await _productRepository
            .GetQueryable()
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.ProductCategory)
            .Include(p => p.Provider)
            .Include(p => p.Currency)
            .Include(p => p.ProductLocalizeds.Where(pl => !pl.IsDeleted))
            .ThenInclude(pl => pl.Language)
            .Include(p => p.ProductMedias.Where(pm => !pm.IsDeleted))
            .FirstOrDefaultAsync(cancellationToken);

        if (productResult == null)
            return Result.Failure<ProductDto?>("Product not found");

        var dto = await MapToDtoAsync(productResult, cancellationToken);
        return Result.Success<ProductDto?>(dto);
    }

    private Result ValidateUpdateWithMediaDto(UpdateProductWithMediaDto updateDto)
    {
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.PRODUCT_NAME_REQUIRED);

        if (updateDto.Name.Length > 200)
            return Result.Failure(MessageCodes.PRODUCT_NAME_TOO_LONG);

        if (updateDto.CategoryId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_CATEGORY_ID_REQUIRED);

        if (updateDto.ProviderId <= 0)
            return Result.Failure(MessageCodes.PRODUCT_PROVIDER_ID_REQUIRED);

        if (updateDto.Price < 0)
            return Result.Failure(MessageCodes.PRODUCT_PRICE_INVALID);

        if (updateDto.Quantity < 0)
            return Result.Failure(MessageCodes.PRODUCT_QUANTITY_INVALID);

        if (updateDto.CurrencyId <= 0)
            return Result.Failure("Valid currency ID is required");

        // Validate localized data
        foreach (var localized in updateDto.Localizations)
        {
            if (string.IsNullOrWhiteSpace(localized.NameLocalized))
                return Result.Failure("Localized product name is required");

            if (localized.NameLocalized.Length > 200)
                return Result.Failure("Localized product name is too long");

            if (localized.LanguageId <= 0)
                return Result.Failure("Valid language ID is required for localization");
        }

        // Validate media URLs
        foreach (var mediaUrl in updateDto.MediaUrls)
        {
            if (string.IsNullOrWhiteSpace(mediaUrl))
                continue;

            if (!Uri.IsWellFormedUriString(mediaUrl, UriKind.Absolute))
                return Result.Failure(MessageCodes.MEDIA_URL_INVALID);
        }

        return Result.Success();
    }
}
