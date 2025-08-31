using System;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Categories.DTOs;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Languages;

namespace Asala.UseCases.Categories;

public class ProductCategoryService : IProductCategoryService
{
    private readonly IProductCategoryRepository _productCategoryRepository;
    private readonly IProductCategoryLocalizedRepository _productCategoryLocalizedRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductCategoryService(
        IProductCategoryRepository productCategoryRepository,
        IProductCategoryLocalizedRepository productCategoryLocalizedRepository,
        ILanguageRepository languageRepository,
        IUnitOfWork unitOfWork
    )
    {
        _productCategoryRepository =
            productCategoryRepository
            ?? throw new ArgumentNullException(nameof(productCategoryRepository));
        _productCategoryLocalizedRepository =
            productCategoryLocalizedRepository
            ?? throw new ArgumentNullException(nameof(productCategoryLocalizedRepository));
        _languageRepository =
            languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<ProductCategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<ProductCategory, bool>> filter = activeOnly switch
        {
            true => pc => pc.IsActive && !pc.IsDeleted, // Only active product categories
            false => pc => !pc.IsActive && !pc.IsDeleted, // Only inactive product categories
            null => pc => !pc.IsDeleted, // All product categories (both active and inactive)
        };

        var result = await _productCategoryRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(pc => pc.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<ProductCategoryDto>>(result.MessageCode);

        var productCategoryDtos = new List<ProductCategoryDto>();
        foreach (var productCategory in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(productCategory, cancellationToken);
            productCategoryDtos.Add(dto);
        }
        var paginatedResult = new PaginatedResult<ProductCategoryDto>(
            productCategoryDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<ProductCategoryDto>> CreateAsync(
        CreateProductCategoryDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<ProductCategoryDto>("CreateDto cannot be null");

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure<ProductCategoryDto>("Product category name is required");

        if (string.IsNullOrWhiteSpace(createDto.Description))
            return Result.Failure<ProductCategoryDto>("Product category description is required");

        // Check if parent category exists
        if (createDto.ParentId.HasValue)
        {
            var parentExistsResult = await _productCategoryRepository.AnyAsync(
                pc => pc.Id == createDto.ParentId.Value && !pc.IsDeleted,
                cancellationToken
            );
            if (parentExistsResult.IsFailure)
                return Result.Failure<ProductCategoryDto>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<ProductCategoryDto>("Parent product category not found");
        }

        var productCategory = new ProductCategory
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            ParentId = createDto.ParentId,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var result = await _productCategoryRepository.AddAsync(productCategory, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<ProductCategoryDto>(result.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProductCategoryDto>(saveResult.MessageCode);

        var productCategoryDto = await MapToDtoAsync(result.Value!, cancellationToken);

        // Handle localizations if provided
        if (createDto.Localizations?.Count > 0)
        {
            await CreateLocalizationsAsync(
                result.Value!.Id,
                createDto.Localizations,
                cancellationToken
            );
            // Refresh the DTO with localizations
            productCategoryDto = await MapToDtoAsync(result.Value!, cancellationToken);
        }

        return Result.Success(productCategoryDto);
    }

    public async Task<Result<ProductCategoryDto?>> UpdateAsync(
        int id,
        UpdateProductCategoryDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (updateDto == null)
            return Result.Failure<ProductCategoryDto?>("UpdateDto cannot be null");

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure<ProductCategoryDto?>("Product category name is required");

        if (string.IsNullOrWhiteSpace(updateDto.Description))
            return Result.Failure<ProductCategoryDto?>("Product category description is required");

        var productCategory = await _productCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (productCategory.IsFailure)
            return Result.Failure<ProductCategoryDto?>(productCategory.MessageCode);

        if (productCategory.Value == null)
            return Result.Failure<ProductCategoryDto?>("Product category not found");

        // Check if parent category exists
        if (updateDto.ParentId.HasValue)
        {
            if (updateDto.ParentId.Value == id)
                return Result.Failure<ProductCategoryDto?>(
                    "Product category cannot be its own parent"
                );

            var parentExistsResult = await _productCategoryRepository.AnyAsync(
                pc => pc.Id == updateDto.ParentId.Value && !pc.IsDeleted,
                cancellationToken
            );
            if (parentExistsResult.IsFailure)
                return Result.Failure<ProductCategoryDto?>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<ProductCategoryDto?>("Parent product category not found");
        }

        productCategory.Value.Name = updateDto.Name.Trim();
        productCategory.Value.Description = updateDto.Description.Trim();
        productCategory.Value.ParentId = updateDto.ParentId;
        productCategory.Value.IsActive = updateDto.IsActive;
        productCategory.Value.UpdatedAt = DateTime.UtcNow;

        _productCategoryRepository.Update(productCategory.Value);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProductCategoryDto?>(saveResult.MessageCode);

        // Handle localizations if provided
        if (updateDto.Localizations?.Count > 0)
        {
            await UpdateLocalizationsAsync(id, updateDto.Localizations, cancellationToken);
        }

        var productCategoryDto = await MapToDtoAsync(productCategory.Value, cancellationToken);
        return Result.Success<ProductCategoryDto?>(productCategoryDto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var productCategory = await _productCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (productCategory.IsFailure)
            return productCategory;

        if (productCategory.Value == null)
            return Result.Failure("Product category not found");

        productCategory.Value.IsActive = false;
        productCategory.Value.UpdatedAt = DateTime.UtcNow;

        _productCategoryRepository.Update(productCategory.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var productCategory = await _productCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (productCategory.IsFailure)
            return productCategory;

        if (productCategory.Value == null)
            return Result.Failure("Product category not found");

        productCategory.Value.IsActive = !productCategory.Value.IsActive;
        productCategory.Value.UpdatedAt = DateTime.UtcNow;

        _productCategoryRepository.Update(productCategory.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<ProductCategoryDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        var productCategories = await _productCategoryRepository.GetAsync(
            filter: pc => pc.IsActive,
            orderBy: q => q.OrderBy(pc => pc.Name)
        );

        if (productCategories.IsFailure)
            return Result.Failure<IEnumerable<ProductCategoryDropdownDto>>(
                productCategories.MessageCode
            );

        var dropdownDtos = productCategories
            .Value!.Select(pc => new ProductCategoryDropdownDto
            {
                Id = pc.Id,
                Name = pc.Name,
                ParentId = pc.ParentId,
            })
            .ToList();

        return Result.Success<IEnumerable<ProductCategoryDropdownDto>>(dropdownDtos);
    }

    public async Task<Result<ProductCategoryDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<ProductCategoryDto?>("Product category ID is invalid");

        var productCategoryResult = await _productCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (productCategoryResult.IsFailure)
            return Result.Failure<ProductCategoryDto?>(productCategoryResult.MessageCode);

        if (productCategoryResult.Value == null || productCategoryResult.Value.IsDeleted)
            return Result.Failure<ProductCategoryDto?>("Product category not found");

        var productCategoryDto = await MapToDtoAsync(productCategoryResult.Value, cancellationToken);
        return Result.Success<ProductCategoryDto?>(productCategoryDto);
    }

    public async Task<Result<IEnumerable<int>>> GetProductCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        // Delegate to the optimized repository method that uses efficient SQL joins
        return await _productCategoryRepository.GetProductCategoriesMissingTranslationsAsync(cancellationToken);
    }

    private async Task CreateLocalizationsAsync(
        int productCategoryId,
        List<CreateProductCategoryLocalizedDto> localizations,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var localizationDto in localizations)
        {
            var localization = new ProductCategoryLocalized
            {
                CategoryId = productCategoryId,
                NameLocalized = localizationDto.NameLocalized,
                DecriptionLocalized = localizationDto.DescriptionLocalized,
                LanguageId = localizationDto.LanguageId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _productCategoryLocalizedRepository.AddAsync(localization, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateLocalizationsAsync(
        int productCategoryId,
        List<UpdateProductCategoryLocalizedDto> localizations,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var localizationDto in localizations)
        {
            if (localizationDto.Id.HasValue)
            {
                // Update existing localization
                var existingResult = await _productCategoryLocalizedRepository.GetByIdAsync(
                    localizationDto.Id.Value,
                    cancellationToken
                );
                if (existingResult.IsSuccess && existingResult.Value != null)
                {
                    existingResult.Value.NameLocalized = localizationDto.NameLocalized;
                    existingResult.Value.DecriptionLocalized =
                        localizationDto.DescriptionLocalized;
                    existingResult.Value.LanguageId = localizationDto.LanguageId;
                    existingResult.Value.IsActive = localizationDto.IsActive;
                    existingResult.Value.UpdatedAt = DateTime.UtcNow;

                    _productCategoryLocalizedRepository.Update(existingResult.Value);
                }
            }
            else
            {
                // Create new localization
                var localization = new ProductCategoryLocalized
                {
                    CategoryId = productCategoryId,
                    NameLocalized = localizationDto.NameLocalized,
                    DecriptionLocalized = localizationDto.DescriptionLocalized,
                    LanguageId = localizationDto.LanguageId,
                    IsActive = localizationDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                await _productCategoryLocalizedRepository.AddAsync(localization, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<ProductCategoryDto> MapToDtoAsync(
        ProductCategory productCategory,
        CancellationToken cancellationToken = default
    )
    {
        var localizations = await GetProductCategoryLocalizationsAsync(
            productCategory.Id,
            cancellationToken
        );

        return new ProductCategoryDto
        {
            Id = productCategory.Id,
            Name = productCategory.Name,
            Description = productCategory.Description,
            ParentId = productCategory.ParentId,
            IsActive = productCategory.IsActive,
            CreatedAt = productCategory.CreatedAt,
            UpdatedAt = productCategory.UpdatedAt,
            Localizations = localizations,
        };
    }

    private async Task<List<ProductCategoryLocalizedDto>> GetProductCategoryLocalizationsAsync(
        int productCategoryId,
        CancellationToken cancellationToken = default
    )
    {
        var localizationsResult = await _productCategoryLocalizedRepository.GetAsync(filter: pcl =>
            pcl.CategoryId == productCategoryId
        );

        if (localizationsResult.IsFailure || localizationsResult.Value == null)
            return [];

        var localizations = new List<ProductCategoryLocalizedDto>();
        foreach (var localization in localizationsResult.Value)
        {
            var languageResult = await _languageRepository.GetByIdAsync(
                localization.LanguageId,
                cancellationToken
            );
            if (languageResult.IsSuccess && languageResult.Value != null)
            {
                localizations.Add(
                    new ProductCategoryLocalizedDto
                    {
                        Id = localization.Id,
                        ProductCategoryId = localization.CategoryId,
                        NameLocalized = localization.NameLocalized,
                        DescriptionLocalized = localization.DecriptionLocalized,
                        LanguageId = localization.LanguageId,
                        LanguageName = languageResult.Value.Name,
                        LanguageCode = languageResult.Value.Code,
                        IsActive = localization.IsActive,
                        CreatedAt = localization.CreatedAt,
                        UpdatedAt = localization.UpdatedAt,
                    }
                );
            }
        }

        return localizations;
    }
}
