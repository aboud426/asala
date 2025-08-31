using System;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Categories.Models;

namespace Asala.UseCases.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository categoryRepository, IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
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

    private static CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
