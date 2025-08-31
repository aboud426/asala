using System;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.DTOs;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Categories.Models;

namespace Asala.UseCases.Categories;

public class ProviderCategoryService : IProviderCategoryService
{
    private readonly IProviderCategoryRepository _providerCategoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProviderCategoryService(IProviderCategoryRepository providerCategoryRepository, IUnitOfWork unitOfWork)
    {
        _providerCategoryRepository = providerCategoryRepository ?? throw new ArgumentNullException(nameof(providerCategoryRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<ProviderCategoryDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        Expression<Func<ProviderCategory, bool>> filter = activeOnly switch
        {
            true => pc => pc.IsActive && !pc.IsDeleted, // Only active provider categories
            false => pc => !pc.IsActive && !pc.IsDeleted, // Only inactive provider categories
            null => pc => !pc.IsDeleted, // All provider categories (both active and inactive)
        };

        var result = await _providerCategoryRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(pc => pc.Id));

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<ProviderCategoryDto>>(result.MessageCode);

        var providerCategoryDtos = result.Value!.Items.Select(MapToDto).ToList();
        var paginatedResult = new PaginatedResult<ProviderCategoryDto>(
            providerCategoryDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<ProviderCategoryDto>> CreateAsync(
        CreateProviderCategoryDto createDto,
        CancellationToken cancellationToken = default)
    {
        if (createDto == null)
            return Result.Failure<ProviderCategoryDto>("CreateDto cannot be null");

        if (createDto.CategoryId <= 0)
            return Result.Failure<ProviderCategoryDto>("Category ID is required");

        if (createDto.ProviderId <= 0)
            return Result.Failure<ProviderCategoryDto>("Provider ID is required");

        // Check if the relationship already exists
        var existingRelationship = await _providerCategoryRepository.GetAsync(
            filter: pc => pc.CategoryId == createDto.CategoryId && pc.ProviderId == createDto.ProviderId);

        if (existingRelationship.IsFailure)
            return Result.Failure<ProviderCategoryDto>(existingRelationship.MessageCode);

        if (existingRelationship.Value != null && existingRelationship.Value.Any())
        {
            return Result.Failure<ProviderCategoryDto>("Provider-Category relationship already exists");
        }

        var providerCategory = new ProviderCategory
        {
            CategoryId = createDto.CategoryId,
            ProviderId = createDto.ProviderId,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _providerCategoryRepository.AddAsync(providerCategory, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<ProviderCategoryDto>(result.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProviderCategoryDto>(saveResult.MessageCode);

        return Result.Success(MapToDto(result.Value!));
    }

    public async Task<Result<ProviderCategoryDto?>> UpdateAsync(
        int id,
        UpdateProviderCategoryDto updateDto,
        CancellationToken cancellationToken = default)
    {
        if (updateDto == null)
            return Result.Failure<ProviderCategoryDto?>("UpdateDto cannot be null");

        var providerCategory = await _providerCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (providerCategory.IsFailure)
            return Result.Failure<ProviderCategoryDto?>(providerCategory.MessageCode);

        if (providerCategory.Value == null)
            return Result.Failure<ProviderCategoryDto?>("Provider-Category relationship not found");

        providerCategory.Value.IsActive = updateDto.IsActive;
        providerCategory.Value.UpdatedAt = DateTime.UtcNow;

        _providerCategoryRepository.Update(providerCategory.Value);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProviderCategoryDto?>(saveResult.MessageCode);

        return Result.Success<ProviderCategoryDto?>(MapToDto(providerCategory.Value));
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var providerCategory = await _providerCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (providerCategory.IsFailure)
            return providerCategory;

        if (providerCategory.Value == null)
            return Result.Failure("Provider-Category relationship not found");

        providerCategory.Value.IsActive = false;
        providerCategory.Value.UpdatedAt = DateTime.UtcNow;

        _providerCategoryRepository.Update(providerCategory.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default)
    {
        var providerCategory = await _providerCategoryRepository.GetByIdAsync(id, cancellationToken);
        if (providerCategory.IsFailure)
            return providerCategory;

        if (providerCategory.Value == null)
            return Result.Failure("Provider-Category relationship not found");

        providerCategory.Value.IsActive = !providerCategory.Value.IsActive;
        providerCategory.Value.UpdatedAt = DateTime.UtcNow;

        _providerCategoryRepository.Update(providerCategory.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ProviderCategoryDto MapToDto(ProviderCategory providerCategory)
    {
        return new ProviderCategoryDto
        {
            Id = providerCategory.Id,
            CategoryId = providerCategory.CategoryId,
            ProviderId = providerCategory.ProviderId,
            IsActive = providerCategory.IsActive,
            CreatedAt = providerCategory.CreatedAt,
            UpdatedAt = providerCategory.UpdatedAt
        };
    }
}
