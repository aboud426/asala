using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.ClientPages.Db;
using Asala.Core.Modules.ClientPages.DTOs;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.ClientPages;

public class ProductsPagesService : IProductsPagesService
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly IProductsPagesRepository _productsPagesRepository;
    private readonly IProductsPagesLocalizedRepository _productsPagesLocalizedRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductsPagesService(
        IProductsPagesRepository productsPagesRepository,
        IProductsPagesLocalizedRepository productsPagesLocalizedRepository,
        IUnitOfWork unitOfWork
    )
    {
        _productsPagesRepository = productsPagesRepository;
        _productsPagesLocalizedRepository = productsPagesLocalizedRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<ProductsPagesDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        if (page < MinPage)
            return Result.Failure<PaginatedResult<ProductsPagesDto>>(
                MessageCodes.InvalidPage,
                $"Page must be at least {MinPage}"
            );

        if (pageSize < MinPageSize || pageSize > MaxPageSize)
            return Result.Failure<PaginatedResult<ProductsPagesDto>>(
                MessageCodes.InvalidPageSize,
                $"Page size must be between {MinPageSize} and {MaxPageSize}"
            );

        try
        {
            var queryable = _productsPagesRepository.GetQueryable();

            if (activeOnly)
                queryable = queryable.Where(x => x.IsActive);

            var totalCount = await queryable.CountAsync(cancellationToken);

            var productsPages = await queryable
                .Include(x => x.Localizations.Where(l => l.IsActive))
                .Include(x => x.IncludedProductTypes)
                .ThenInclude(i => i.ProductCategory)
                .OrderBy(x => x.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var productsPagesDto = productsPages.Select(MapToDto).ToList();

            return Result.Success(
                new PaginatedResult<ProductsPagesDto>(productsPagesDto, totalCount, page, pageSize)
            );
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<ProductsPagesDto>>(
                MessageCodes.InternalServerError,
                ex.Message
            );
        }
    }

    public async Task<Result<ProductsPagesDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var productsPages =
                await _productsPagesRepository.GetByIdWithLocalizationsAndIncludedTypesAsync(id);

            if (productsPages == null)
                return Result.Failure<ProductsPagesDto>(
                    MessageCodes.NotFound,
                    "ProductsPages not found"
                );

            return Result.Success(MapToDto(productsPages));
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<ProductsPagesDto>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(key))
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        try
        {
            var productsPages =
                await _productsPagesRepository.GetByKeyWithLocalizationsAndIncludedTypesAsync(key);

            if (productsPages == null)
                return Result.Failure<ProductsPagesDto>(
                    MessageCodes.NotFound,
                    "ProductsPages not found"
                );

            return Result.Success(MapToDto(productsPages));
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<ProductsPagesDto>> CreateAsync(
        CreateProductsPagesDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Create data cannot be null"
            );

        if (string.IsNullOrWhiteSpace(createDto.Key))
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Name cannot be empty"
            );

        try
        {
            // Check if key already exists
            var existingProductsPages = await _productsPagesRepository.GetByKeyAsync(createDto.Key);
            if (existingProductsPages != null)
                return Result.Failure<ProductsPagesDto>(
                    MessageCodes.AlreadyExists,
                    "ProductsPages with this key already exists"
                );

            var productsPages = new ProductsPages
            {
                Key = createDto.Key,
                Name = createDto.Name,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _productsPagesRepository.AddAsync(productsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Add localizations if provided
            if (createDto.Localizations?.Any() == true)
            {
                var localizations = createDto.Localizations.Select(locDto => new ProductsPagesLocalized
                {
                    ProductsPagesId = productsPages.Id,
                    NameLocalized = locDto.NameLocalized,
                    DescriptionLocalized = locDto.DescriptionLocalized,
                    LanguageId = locDto.LanguageId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });

                await _productsPagesLocalizedRepository.AddRangeAsync(localizations);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // Add included product categories if provided
            if (createDto.IncludedProductCategoryIds?.Any() == true)
            {
                await _productsPagesRepository.AddIncludedProductTypesAsync(
                    productsPages.Id,
                    createDto.IncludedProductCategoryIds
                );
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            var result = await GetByIdAsync(productsPages.Id, cancellationToken);
            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<ProductsPagesDto>> UpdateAsync(
        int id,
        UpdateProductsPagesDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (updateDto == null)
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Update data cannot be null"
            );

        if (string.IsNullOrWhiteSpace(updateDto.Key))
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure<ProductsPagesDto>(
                MessageCodes.InvalidInput,
                "Name cannot be empty"
            );

        try
        {
            var productsPages = await _productsPagesRepository.GetByIdAsync(id);
            if (productsPages == null)
                return Result.Failure<ProductsPagesDto>(
                    MessageCodes.NotFound,
                    "ProductsPages not found"
                );

            // Check if key already exists (excluding current entity)
            var existingWithKey = await _productsPagesRepository.GetByKeyAsync(updateDto.Key);
            if (existingWithKey != null && existingWithKey.Id != id)
                return Result.Failure<ProductsPagesDto>(
                    MessageCodes.AlreadyExists,
                    "ProductsPages with this key already exists"
                );

            productsPages.Key = updateDto.Key;
            productsPages.Name = updateDto.Name;
            productsPages.Description = updateDto.Description;
            productsPages.IsActive = updateDto.IsActive;
            productsPages.UpdatedAt = DateTime.UtcNow;

            await _productsPagesRepository.UpdateAsync(productsPages);

            // Update localizations
            await UpdateLocalizationsAsync(id, updateDto.Localizations, cancellationToken);

            // Update included product categories
            await _productsPagesRepository.UpdateIncludedProductTypesAsync(
                id,
                updateDto.IncludedProductCategoryIds ?? new List<int>()
            );

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var result = await GetByIdAsync(productsPages.Id, cancellationToken);
            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var productsPages = await _productsPagesRepository.GetByIdAsync(id);
            if (productsPages == null)
                return Result.Failure(MessageCodes.NotFound, "ProductsPages not found");

            productsPages.IsActive = false;
            productsPages.UpdatedAt = DateTime.UtcNow;

            await _productsPagesRepository.UpdateAsync(productsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var productsPages = await _productsPagesRepository.GetByIdAsync(id);
            if (productsPages == null)
                return Result.Failure(MessageCodes.NotFound, "ProductsPages not found");

            productsPages.IsActive = !productsPages.IsActive;
            productsPages.UpdatedAt = DateTime.UtcNow;

            await _productsPagesRepository.UpdateAsync(productsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<IEnumerable<ProductsPagesDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var productsPages = await _productsPagesRepository.GetAllAsync();
            var dropdownItems = productsPages
                .Where(x => x.IsActive)
                .Select(x => new ProductsPagesDropdownDto
                {
                    Id = x.Id,
                    Key = x.Key,
                    Name = x.Name
                })
                .OrderBy(x => x.Name)
                .ToList();

            return Result.Success<IEnumerable<ProductsPagesDropdownDto>>(dropdownItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<ProductsPagesDropdownDto>>(
                MessageCodes.InternalServerError,
                ex.Message
            );
        }
    }

    public async Task<Result> UpdateIncludedProductCategoriesAsync(
        int id,
        IEnumerable<int> productCategoryIds,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var productsPages = await _productsPagesRepository.GetByIdAsync(id);
            if (productsPages == null)
                return Result.Failure(MessageCodes.NotFound, "ProductsPages not found");

            await _productsPagesRepository.UpdateIncludedProductTypesAsync(
                id,
                productCategoryIds ?? Enumerable.Empty<int>()
            );
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    private async Task UpdateLocalizationsAsync(
        int productsPagesId,
        List<UpdateProductsPagesLocalizedDto> localizationDtos,
        CancellationToken cancellationToken = default
    )
    {
        var existingLocalizations = await _productsPagesLocalizedRepository
            .GetQueryable()
            .Where(x => x.ProductsPagesId == productsPagesId)
            .ToListAsync(cancellationToken);

        foreach (var locDto in localizationDtos ?? new List<UpdateProductsPagesLocalizedDto>())
        {
            if (locDto.Id.HasValue)
            {
                // Update existing localization
                var existing = existingLocalizations.FirstOrDefault(x => x.Id == locDto.Id.Value);
                if (existing != null)
                {
                    existing.NameLocalized = locDto.NameLocalized;
                    existing.DescriptionLocalized = locDto.DescriptionLocalized;
                    existing.LanguageId = locDto.LanguageId;
                    existing.IsActive = locDto.IsActive;
                    existing.UpdatedAt = DateTime.UtcNow;

                    await _productsPagesLocalizedRepository.UpdateAsync(existing);
                }
            }
            else
            {
                // Create new localization
                var newLocalization = new ProductsPagesLocalized
                {
                    ProductsPagesId = productsPagesId,
                    NameLocalized = locDto.NameLocalized,
                    DescriptionLocalized = locDto.DescriptionLocalized,
                    LanguageId = locDto.LanguageId,
                    IsActive = locDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                await _productsPagesLocalizedRepository.AddAsync(newLocalization);
            }
        }
    }

    private static ProductsPagesDto MapToDto(ProductsPages productsPages)
    {
        return new ProductsPagesDto
        {
            Id = productsPages.Id,
            Key = productsPages.Key,
            Name = productsPages.Name,
            Description = productsPages.Description,
            IsActive = productsPages.IsActive,
            CreatedAt = productsPages.CreatedAt,
            UpdatedAt = productsPages.UpdatedAt,
            Localizations = productsPages.Localizations
                ?.Select(l => new ProductsPagesLocalizedDto
                {
                    Id = l.Id,
                    ProductsPagesId = l.ProductsPagesId,
                    NameLocalized = l.NameLocalized,
                    DescriptionLocalized = l.DescriptionLocalized,
                    LanguageId = l.LanguageId,
                    IsActive = l.IsActive,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                })
                .ToList() ?? new List<ProductsPagesLocalizedDto>(),
            IncludedProductTypes = productsPages.IncludedProductTypes
                ?.Select(ipt => new IncludedProductTypeDto
                {
                    Id = ipt.Id,
                    ProductsPagesId = ipt.ProductsPagesId,
                    ProductCategoryId = ipt.ProductCategoryId,
                    ProductCategory = new ProductCategoryDto
                    {
                        Id = ipt.ProductCategory.Id,
                        Name = ipt.ProductCategory.Name,
                        Description = ipt.ProductCategory.Description,
                        ParentId = ipt.ProductCategory.ParentId,
                        ImageUrl = ipt.ProductCategory.ImageUrl,
                        IsActive = ipt.ProductCategory.IsActive,
                        CreatedAt = ipt.ProductCategory.CreatedAt,
                        UpdatedAt = ipt.ProductCategory.UpdatedAt,
                    },
                    IsActive = ipt.IsActive,
                    CreatedAt = ipt.CreatedAt,
                    UpdatedAt = ipt.UpdatedAt,
                })
                .ToList() ?? new List<IncludedProductTypeDto>(),
        };
    }
}
