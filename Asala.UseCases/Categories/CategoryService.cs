using System;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Categories.DTOs;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Languages;

namespace Asala.UseCases.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ICategoryLocalizedRepository _categoryLocalizedRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(
        ICategoryRepository categoryRepository,
        ICategoryLocalizedRepository categoryLocalizedRepository,
        ILanguageRepository languageRepository,
        IUnitOfWork unitOfWork
    )
    {
        _categoryRepository =
            categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _categoryLocalizedRepository =
            categoryLocalizedRepository
            ?? throw new ArgumentNullException(nameof(categoryLocalizedRepository));
        _languageRepository =
            languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<CategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Category, bool>> filter = activeOnly switch
        {
            true => c => c.IsActive && !c.IsDeleted, // Only active categories
            false => c => !c.IsActive && !c.IsDeleted, // Only inactive categories
            null => c => !c.IsDeleted, // All categories (both active and inactive)
        };

        var result = await _categoryRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(c => c.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<CategoryDto>>(result.MessageCode);

        var categoryDtos = new List<CategoryDto>();
        foreach (var category in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(category, cancellationToken);
            categoryDtos.Add(dto);
        }
        var paginatedResult = new PaginatedResult<CategoryDto>(
            categoryDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<CategoryDto>> CreateAsync(
        CreateCategoryDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<CategoryDto>("CreateDto cannot be null");

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure<CategoryDto>("Category name is required");

        // Check if parent category exists
        if (createDto.ParentId.HasValue)
        {
            var parentExistsResult = await _categoryRepository.AnyAsync(
                c => c.Id == createDto.ParentId.Value && !c.IsDeleted,
                cancellationToken
            );
            if (parentExistsResult.IsFailure)
                return Result.Failure<CategoryDto>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<CategoryDto>("Parent category not found");
        }

        var category = new Category
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            ParentId = createDto.ParentId,
            ImageUrl = createDto.ImageUrl,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var result = await _categoryRepository.AddAsync(category, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CategoryDto>(result.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CategoryDto>(saveResult.MessageCode);

        var categoryDto = await MapToDtoAsync(result.Value!, cancellationToken);

        // Handle localizations if provided
        if (createDto.Localizations?.Count > 0)
        {
            await CreateLocalizationsAsync(
                result.Value!.Id,
                createDto.Localizations,
                cancellationToken
            );
            // Refresh the DTO with localizations
            categoryDto = await MapToDtoAsync(result.Value!, cancellationToken);
        }

        return Result.Success(categoryDto);
    }

    public async Task<Result<CategoryDto?>> UpdateAsync(
        int id,
        UpdateCategoryDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (updateDto == null)
            return Result.Failure<CategoryDto?>("UpdateDto cannot be null");

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure<CategoryDto?>("Category name is required");

        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category.IsFailure)
            return Result.Failure<CategoryDto?>(category.MessageCode);

        if (category.Value == null)
            return Result.Failure<CategoryDto?>("Category not found");

        // Check if parent category exists
        if (updateDto.ParentId.HasValue)
        {
            if (updateDto.ParentId.Value == id)
                return Result.Failure<CategoryDto?>("Category cannot be its own parent");

            var parentExistsResult = await _categoryRepository.AnyAsync(
                c => c.Id == updateDto.ParentId.Value && !c.IsDeleted,
                cancellationToken
            );
            if (parentExistsResult.IsFailure)
                return Result.Failure<CategoryDto?>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<CategoryDto?>("Parent category not found");
        }

        category.Value.Name = updateDto.Name.Trim();
        category.Value.Description = updateDto.Description.Trim();
        category.Value.ParentId = updateDto.ParentId;
        category.Value.ImageUrl = updateDto.ImageUrl;
        category.Value.IsActive = updateDto.IsActive;
        category.Value.UpdatedAt = DateTime.UtcNow;

        _categoryRepository.Update(category.Value);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CategoryDto?>(saveResult.MessageCode);

        // Handle localizations if provided
        if (updateDto.Localizations?.Count > 0)
        {
            await UpdateLocalizationsAsync(id, updateDto.Localizations, cancellationToken);
        }

        var categoryDto = await MapToDtoAsync(category.Value, cancellationToken);
        return Result.Success<CategoryDto?>(categoryDto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category.IsFailure)
            return category;

        if (category.Value == null)
            return Result.Failure("Category not found");

        category.Value.IsActive = false;
        category.Value.UpdatedAt = DateTime.UtcNow;

        _categoryRepository.Update(category.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category.IsFailure)
            return category;

        if (category.Value == null)
            return Result.Failure("Category not found");

        category.Value.IsActive = !category.Value.IsActive;
        category.Value.UpdatedAt = DateTime.UtcNow;

        _categoryRepository.Update(category.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<CategoryDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        var categories = await _categoryRepository.GetAsync(
            filter: c => c.IsActive,
            orderBy: q => q.OrderBy(c => c.Name)
        );

        if (categories.IsFailure)
            return Result.Failure<IEnumerable<CategoryDropdownDto>>(categories.MessageCode);

        var dropdownDtos = categories
            .Value!.Select(c => new CategoryDropdownDto
            {
                Id = c.Id,
                Name = c.Name,
                ParentId = c.ParentId,
                ImageUrl = c.ImageUrl,
            })
            .ToList();

        return Result.Success<IEnumerable<CategoryDropdownDto>>(dropdownDtos);
    }

    public async Task<Result<IEnumerable<CategoryDto>>> GetSubcategoriesAsync(
        int parentId,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var subcategories = await _categoryRepository.GetAsync(
            filter: c => c.ParentId == parentId && c.IsActive && !c.IsDeleted,
            orderBy: q => q.OrderBy(c => c.Name)
        );

        if (subcategories.IsFailure)
            return Result.Failure<IEnumerable<CategoryDto>>(subcategories.MessageCode);

        var subcategoryDtos = new List<CategoryDto>();
        foreach (var category in subcategories.Value!)
        {
            var dto = await MapToDtoAsync(category, cancellationToken);
            subcategoryDtos.Add(dto);
        }

        return Result.Success<IEnumerable<CategoryDto>>(subcategoryDtos);
    }

    public async Task<Result<IEnumerable<CategoryTreeDto>>> GetCategoryTreeAsync(
        int? rootId = null,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        // Get all active categories
        var allCategories = await _categoryRepository.GetAsync(
            filter: c => !c.IsDeleted,
            orderBy: q => q.OrderBy(c => c.Name)
        );

        if (allCategories.IsFailure)
            return Result.Failure<IEnumerable<CategoryTreeDto>>(allCategories.MessageCode);

        var categories = allCategories.Value!.ToList();

        // If rootId is specified, start from that category
        if (rootId.HasValue)
        {
            var rootCategory = categories.FirstOrDefault(c => c.Id == rootId.Value);
            if (rootCategory == null)
                return Result.Failure<IEnumerable<CategoryTreeDto>>("Root category not found");

            var tree = await BuildCategoryTreeAsync(rootCategory, categories, cancellationToken);
            return Result.Success<IEnumerable<CategoryTreeDto>>(new List<CategoryTreeDto> { tree });
        }

        // Otherwise, get all root categories (categories with no parent)
        var rootCategories = categories.Where(c => c.ParentId == null).ToList();
        var trees = new List<CategoryTreeDto>();
        foreach (var rootCategory in rootCategories)
        {
            var tree = await BuildCategoryTreeAsync(rootCategory, categories, cancellationToken);
            trees.Add(tree);
        }

        return Result.Success<IEnumerable<CategoryTreeDto>>(trees);
    }

    public async Task<Result<IEnumerable<int>>> GetCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        // Delegate to the optimized repository method that uses efficient SQL joins
        return await _categoryRepository.GetCategoriesMissingTranslationsAsync(cancellationToken);
    }

    public async Task<Result<CategoryDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var categoryResult = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (categoryResult.IsFailure)
            return Result.Failure<CategoryDto?>(categoryResult.MessageCode);

        if (categoryResult.Value == null || categoryResult.Value.IsDeleted)
            return Result.Failure<CategoryDto?>("Category not found");

        var categoryDto = await MapToDtoAsync(categoryResult.Value, cancellationToken);
        return Result.Success<CategoryDto?>(categoryDto);
    }

    private async Task<CategoryTreeDto> BuildCategoryTreeAsync(
        Category category,
        List<Category> allCategories,
        CancellationToken cancellationToken = default
    )
    {
        var localizations = await GetCategoryLocalizationsAsync(category.Id, cancellationToken);

        var treeDto = new CategoryTreeDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentId = category.ParentId,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            Localizations = localizations,
            Children = new List<CategoryTreeDto>(),
        };

        // Find all direct children of this category
        var children = allCategories.Where(c => c.ParentId == category.Id).ToList();

        // Recursively build the tree for each child
        foreach (var child in children)
        {
            var childTree = await BuildCategoryTreeAsync(child, allCategories, cancellationToken);
            treeDto.Children.Add(childTree);
        }

        return treeDto;
    }

    private async Task CreateLocalizationsAsync(
        int categoryId,
        List<CreateCategoryLocalizedDto> localizations,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var localizationDto in localizations)
        {
            var localization = new CategoryLocalized
            {
                CategoryId = categoryId,
                NameLocalized = localizationDto.NameLocalized,
                DescriptionLocalized = localizationDto.DescriptionLocalized,
                LanguageId = localizationDto.LanguageId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _categoryLocalizedRepository.AddAsync(localization, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateLocalizationsAsync(
        int categoryId,
        List<UpdateCategoryLocalizedDto> localizations,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var localizationDto in localizations)
        {
            if (localizationDto.Id.HasValue)
            {
                // Update existing localization
                var existingResult = await _categoryLocalizedRepository.GetByIdAsync(
                    localizationDto.Id.Value,
                    cancellationToken
                );
                if (existingResult.IsSuccess && existingResult.Value != null)
                {
                    existingResult.Value.NameLocalized = localizationDto.NameLocalized;
                    existingResult.Value.DescriptionLocalized =
                        localizationDto.DescriptionLocalized;
                    existingResult.Value.LanguageId = localizationDto.LanguageId;
                    existingResult.Value.IsActive = localizationDto.IsActive;
                    existingResult.Value.UpdatedAt = DateTime.UtcNow;

                    _categoryLocalizedRepository.Update(existingResult.Value);
                }
            }
            else
            {
                // Create new localization
                var localization = new CategoryLocalized
                {
                    CategoryId = categoryId,
                    NameLocalized = localizationDto.NameLocalized,
                    DescriptionLocalized = localizationDto.DescriptionLocalized,
                    LanguageId = localizationDto.LanguageId,
                    IsActive = localizationDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                await _categoryLocalizedRepository.AddAsync(localization, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<CategoryDto> MapToDtoAsync(
        Category category,
        CancellationToken cancellationToken = default
    )
    {
        var localizations = await GetCategoryLocalizationsAsync(category.Id, cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentId = category.ParentId,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt,
            Localizations = localizations,
        };
    }

    private async Task<List<CategoryLocalizedDto>> GetCategoryLocalizationsAsync(
        int categoryId,
        CancellationToken cancellationToken = default
    )
    {
        var localizationsResult = await _categoryLocalizedRepository.GetAsync(filter: cl =>
            cl.CategoryId == categoryId
        );

        if (localizationsResult.IsFailure || localizationsResult.Value == null)
            return [];

        var localizations = new List<CategoryLocalizedDto>();
        foreach (var localization in localizationsResult.Value)
        {
            var languageResult = await _languageRepository.GetByIdAsync(
                localization.LanguageId,
                cancellationToken
            );
            if (languageResult.IsSuccess && languageResult.Value != null)
            {
                localizations.Add(
                    new CategoryLocalizedDto
                    {
                        Id = localization.Id,
                        CategoryId = localization.CategoryId,
                        NameLocalized = localization.NameLocalized,
                        DescriptionLocalized = localization.DescriptionLocalized,
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
