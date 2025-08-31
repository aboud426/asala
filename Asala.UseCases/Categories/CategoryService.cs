using System;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Languages;

namespace Asala.UseCases.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ICategoryLocalizedRepository _categoryLocalizedRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository categoryRepository, ICategoryLocalizedRepository categoryLocalizedRepository, ILanguageRepository languageRepository, IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _categoryLocalizedRepository = categoryLocalizedRepository ?? throw new ArgumentNullException(nameof(categoryLocalizedRepository));
        _languageRepository = languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<CategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
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
            orderBy: q => q.OrderBy(c => c.Name));

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<CategoryDto>>(result.MessageCode);

        var categoryDtos = result.Value!.Items.Select(MapToDto).ToList();
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
        CancellationToken cancellationToken = default)
    {
        if (createDto == null)
            return Result.Failure<CategoryDto>("CreateDto cannot be null");

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure<CategoryDto>("Category name is required");

        // Check if parent category exists
        if (createDto.ParentId.HasValue)
        {
            var parentExistsResult = await _categoryRepository.AnyAsync(c => c.Id == createDto.ParentId.Value && !c.IsDeleted, cancellationToken);
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
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _categoryRepository.AddAsync(category, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CategoryDto>(result.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CategoryDto>(saveResult.MessageCode);

        return Result.Success(MapToDto(result.Value!));
    }

    public async Task<Result<CategoryDto?>> UpdateAsync(
        int id,
        UpdateCategoryDto updateDto,
        CancellationToken cancellationToken = default)
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

            var parentExistsResult = await _categoryRepository.AnyAsync(c => c.Id == updateDto.ParentId.Value && !c.IsDeleted, cancellationToken);
            if (parentExistsResult.IsFailure)
                return Result.Failure<CategoryDto?>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<CategoryDto?>("Parent category not found");
        }

        category.Value.Name = updateDto.Name.Trim();
        category.Value.Description = updateDto.Description.Trim();
        category.Value.ParentId = updateDto.ParentId;
        category.Value.IsActive = updateDto.IsActive;
        category.Value.UpdatedAt = DateTime.UtcNow;

        _categoryRepository.Update(category.Value);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CategoryDto?>(saveResult.MessageCode);

        return Result.Success<CategoryDto?>(MapToDto(category.Value));
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

    public async Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default)
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
        CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAsync(
            filter: c => c.IsActive,
            orderBy: q => q.OrderBy(c => c.Name));

        if (categories.IsFailure)
            return Result.Failure<IEnumerable<CategoryDropdownDto>>(categories.MessageCode);

        var dropdownDtos = categories.Value!.Select(c => new CategoryDropdownDto
        {
            Id = c.Id,
            Name = c.Name,
            ParentId = c.ParentId
        }).ToList();

        return Result.Success<IEnumerable<CategoryDropdownDto>>(dropdownDtos);
    }

    public async Task<Result<IEnumerable<CategoryDto>>> GetSubcategoriesAsync(
        int parentId,
        string? languageCode = null,
        CancellationToken cancellationToken = default)
    {
        var subcategories = await _categoryRepository.GetAsync(
            filter: c => c.ParentId == parentId && c.IsActive && !c.IsDeleted,
            orderBy: q => q.OrderBy(c => c.Name));

        if (subcategories.IsFailure)
            return Result.Failure<IEnumerable<CategoryDto>>(subcategories.MessageCode);

        var subcategoryDtos = new List<CategoryDto>();
        foreach (var category in subcategories.Value!)
        {
            var dto = await MapToDtoWithLocalizationAsync(category, languageCode, cancellationToken);
            subcategoryDtos.Add(dto);
        }

        return Result.Success<IEnumerable<CategoryDto>>(subcategoryDtos);
    }

    public async Task<Result<IEnumerable<CategoryTreeDto>>> GetCategoryTreeAsync(
        int? rootId = null,
        string? languageCode = null,
        CancellationToken cancellationToken = default)
    {
        // Get all active categories
        var allCategories = await _categoryRepository.GetAsync(
            filter: c => c.IsActive && !c.IsDeleted,
            orderBy: q => q.OrderBy(c => c.Name));

        if (allCategories.IsFailure)
            return Result.Failure<IEnumerable<CategoryTreeDto>>(allCategories.MessageCode);

        var categories = allCategories.Value!.ToList();

        // Get all localizations for the specified language if provided
        Dictionary<int, CategoryLocalized> localizations = new();
        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            // First, get the language ID from the language code
            var languageResult = await _languageRepository.GetFirstOrDefaultAsync(
                filter: l => l.Code == languageCode && l.IsActive && !l.IsDeleted);

            if (languageResult.IsSuccess && languageResult.Value != null)
            {
                var languageId = languageResult.Value.Id;
                var localizationsResult = await _categoryLocalizedRepository.GetAsync(
                    filter: cl => cl.LanguageId == languageId);
                
                if (localizationsResult.IsSuccess && localizationsResult.Value != null)
                {
                    localizations = localizationsResult.Value.ToDictionary(cl => cl.CategoryId, cl => cl);
                }
            }
        }

        // If rootId is specified, start from that category
        if (rootId.HasValue)
        {
            var rootCategory = categories.FirstOrDefault(c => c.Id == rootId.Value);
            if (rootCategory == null)
                return Result.Failure<IEnumerable<CategoryTreeDto>>("Root category not found");

            var tree = BuildCategoryTree(rootCategory, categories, localizations);
            return Result.Success<IEnumerable<CategoryTreeDto>>(new List<CategoryTreeDto> { tree });
        }

        // Otherwise, get all root categories (categories with no parent)
        var rootCategories = categories.Where(c => c.ParentId == null).ToList();
        var trees = rootCategories.Select(root => BuildCategoryTree(root, categories, localizations)).ToList();

        return Result.Success<IEnumerable<CategoryTreeDto>>(trees);
    }

    private static CategoryTreeDto BuildCategoryTree(Category category, List<Category> allCategories, Dictionary<int, CategoryLocalized> localizations)
    {
        var localization = localizations.GetValueOrDefault(category.Id);
        
        var treeDto = new CategoryTreeDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            LocalizedName = localization?.NameLocalized,
            LocalizedDescription = localization?.DescriptionLocalized,
            ParentId = category.ParentId,
            IsActive = category.IsActive,
            Children = new List<CategoryTreeDto>()
        };

        // Find all direct children of this category
        var children = allCategories.Where(c => c.ParentId == category.Id).ToList();
        
        // Recursively build the tree for each child
        foreach (var child in children)
        {
            treeDto.Children.Add(BuildCategoryTree(child, allCategories, localizations));
        }

        return treeDto;
    }

    private async Task<CategoryDto> MapToDtoWithLocalizationAsync(Category category, string? languageCode, CancellationToken cancellationToken)
    {
        var dto = MapToDto(category);

        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            // First, get the language ID from the language code
            var languageResult = await _languageRepository.GetFirstOrDefaultAsync(
                filter: l => l.Code == languageCode && l.IsActive && !l.IsDeleted);

            if (languageResult.IsSuccess && languageResult.Value != null)
            {
                var languageId = languageResult.Value.Id;
                var localizationResult = await _categoryLocalizedRepository.GetFirstOrDefaultAsync(
                    filter: cl => cl.CategoryId == category.Id && cl.LanguageId == languageId);

                if (localizationResult.IsSuccess && localizationResult.Value != null)
                {
                    dto.LocalizedName = localizationResult.Value.NameLocalized;
                    dto.LocalizedDescription = localizationResult.Value.DescriptionLocalized;
                }
            }
        }

        return dto;
    }

    private static CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentId = category.ParentId,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
