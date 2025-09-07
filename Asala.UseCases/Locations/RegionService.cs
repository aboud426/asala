using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Locations.DTOs;
using Asala.Core.Modules.Locations.Models;

namespace Asala.UseCases.Locations;

public class RegionService : IRegionService
{
    private readonly IRegionRepository _regionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegionService(IRegionRepository regionRepository, IUnitOfWork unitOfWork)
    {
        _regionRepository = regionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RegionDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<RegionDto>(MessageCodes.REGION_ID_INVALID);

            var result = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<RegionDto>(result.MessageCode);

            if (result.Value == null)
                return Result.Failure<RegionDto>(MessageCodes.REGION_NOT_FOUND);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<RegionDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<Region, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = r => r.IsActive == isActive.Value && !r.IsDeleted;
            }
            else
            {
                filter = r => !r.IsDeleted;
            }

            var result = await _regionRepository.GetPaginatedAsync(page, pageSize, filter);
            if (!result.IsSuccess)
                return Result.Failure<PaginatedResult<RegionDto>>(result.MessageCode);

            var dtos = result.Value.Items.Select(MapToDto).ToList();
            var paginatedResult = new PaginatedResult<RegionDto>(
                dtos,
                result.Value.TotalCount,
                result.Value.Page,
                result.Value.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<RegionDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<RegionDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<Region, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = r => r.IsActive == isActive.Value && !r.IsDeleted;
            }
            else
            {
                filter = r => !r.IsDeleted;
            }

            var result = await _regionRepository.GetAsync(filter, orderBy: q => q.OrderBy(r => r.Name));
            if (!result.IsSuccess)
                return Result.Failure<List<RegionDropdownDto>>(result.MessageCode);

            var dtos = result.Value.Select(x => new RegionDropdownDto
            {
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                FullPath = x.Name // You can build full path logic here if needed
            }).ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<RegionDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<RegionHierarchyDto>>> GetRegionTreeAsync(bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<Region, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = r => r.IsActive == isActive.Value && !r.IsDeleted;
            }
            else
            {
                filter = r => !r.IsDeleted;
            }

            var result = await _regionRepository.GetAsync(filter, orderBy: q => q.OrderBy(r => r.Name));
            if (!result.IsSuccess)
                return Result.Failure<List<RegionHierarchyDto>>(result.MessageCode);

            // Build tree structure - get root regions (no parent)
            var allRegions = result.Value.ToList();
            var rootRegions = allRegions.Where(r => r.ParentId == null).ToList();
            var tree = new List<RegionHierarchyDto>();

            foreach (var rootRegion in rootRegions)
            {
                var treeNode = BuildRegionTree(rootRegion, allRegions, 0);
                tree.Add(treeNode);
            }

            return Result.Success(tree);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<RegionHierarchyDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<RegionDto>>> GetSubRegionsAsync(int parentId, bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            if (parentId <= 0)
                return Result.Failure<List<RegionDto>>(MessageCodes.REGION_ID_INVALID);

            // Verify parent exists
            var parentResult = await _regionRepository.GetByIdAsync(parentId, cancellationToken);
            if (!parentResult.IsSuccess)
                return Result.Failure<List<RegionDto>>(parentResult.MessageCode);

            if (parentResult.Value == null)
                return Result.Failure<List<RegionDto>>(MessageCodes.REGION_NOT_FOUND);

            Expression<Func<Region, bool>> filter;
            if (isActive.HasValue)
            {
                filter = r => r.ParentId == parentId && r.IsActive == isActive.Value && !r.IsDeleted;
            }
            else
            {
                filter = r => r.ParentId == parentId && !r.IsDeleted;
            }

            var result = await _regionRepository.GetAsync(filter, orderBy: q => q.OrderBy(r => r.Name));
            if (!result.IsSuccess)
                return Result.Failure<List<RegionDto>>(result.MessageCode);

            var dtos = result.Value.Select(MapToDto).ToList();
            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<RegionDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<RegionDto>> CreateAsync(CreateRegionDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validation
            if (string.IsNullOrWhiteSpace(createDto.Name))
                return Result.Failure<RegionDto>(MessageCodes.REGION_NAME_REQUIRED);

            // Validate parent if provided
            if (createDto.ParentId.HasValue)
            {
                var parentResult = await _regionRepository.GetByIdAsync(createDto.ParentId.Value, cancellationToken);
                if (!parentResult.IsSuccess || parentResult.Value == null)
                    return Result.Failure<RegionDto>(MessageCodes.REGION_PARENT_NOT_FOUND);
            }

            // Check if name already exists at the same level
            var existingResult = await _regionRepository.GetFirstOrDefaultAsync(r => r.Name == createDto.Name.Trim() && r.ParentId == createDto.ParentId && !r.IsDeleted);
            if (existingResult.IsSuccess && existingResult.Value != null)
                return Result.Failure<RegionDto>(MessageCodes.REGION_NAME_ALREADY_EXISTS);

            // Create entity
            var region = new Region
            {
                Name = createDto.Name.Trim(),
                ParentId = createDto.ParentId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _regionRepository.AddAsync(region, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<RegionDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<RegionDto>(saveResult.MessageCode);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<RegionDto>> UpdateAsync(int id, UpdateRegionDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<RegionDto>(MessageCodes.REGION_ID_INVALID);

            if (string.IsNullOrWhiteSpace(updateDto.Name))
                return Result.Failure<RegionDto>(MessageCodes.REGION_NAME_REQUIRED);

            // Get existing entity
            var existingResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure<RegionDto>(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure<RegionDto>(MessageCodes.REGION_NOT_FOUND);

            var region = existingResult.Value;

            // Validate parent if provided (and different from current)
            if (updateDto.ParentId.HasValue && updateDto.ParentId != region.ParentId)
            {
                // Cannot set self as parent
                if (updateDto.ParentId == id)
                    return Result.Failure<RegionDto>(MessageCodes.REGION_CANNOT_BE_PARENT_OF_ITSELF);

                // Check if parent exists
                var parentResult = await _regionRepository.GetByIdAsync(updateDto.ParentId.Value, cancellationToken);
                if (!parentResult.IsSuccess || parentResult.Value == null)
                    return Result.Failure<RegionDto>(MessageCodes.REGION_PARENT_NOT_FOUND);

                // Check for circular reference (simplified check)
                if (updateDto.ParentId.Value == id)
                    return Result.Failure<RegionDto>(MessageCodes.REGION_CANNOT_BE_PARENT_OF_ITSELF);
            }

            // Check if new name already exists at the same level (excluding current record)
            var nameCheckResult = await _regionRepository.GetFirstOrDefaultAsync(r => r.Name == updateDto.Name.Trim() && r.ParentId == updateDto.ParentId && r.Id != id && !r.IsDeleted);
            if (nameCheckResult.IsSuccess && nameCheckResult.Value != null)
                return Result.Failure<RegionDto>(MessageCodes.REGION_NAME_ALREADY_EXISTS);

            // Update properties
            region.Name = updateDto.Name.Trim();
            region.ParentId = updateDto.ParentId;
            region.IsActive = updateDto.IsActive;
            region.UpdatedAt = DateTime.UtcNow;

            var result = _regionRepository.Update(region);
            if (!result.IsSuccess)
                return Result.Failure<RegionDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<RegionDto>(saveResult.MessageCode);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.REGION_ID_INVALID);

            // Get existing entity
            var existingResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.REGION_NOT_FOUND);

            // Check if region has child regions
            var hasChildrenResult = await _regionRepository.AnyAsync(r => r.ParentId == id && !r.IsDeleted, cancellationToken);
            if (!hasChildrenResult.IsSuccess)
                return Result.Failure(hasChildrenResult.MessageCode);

            if (hasChildrenResult.Value)
                return Result.Failure(MessageCodes.REGION_HAS_CHILDREN_CANNOT_DELETE);

            // Soft delete
            var region = existingResult.Value;
            region.IsDeleted = true;
            region.IsActive = false;
            region.DeletedAt = DateTime.UtcNow;
            region.UpdatedAt = DateTime.UtcNow;

            var result = _regionRepository.Update(region);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> ActivateAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.REGION_ID_INVALID);

            var existingResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.REGION_NOT_FOUND);

            var region = existingResult.Value;
            region.IsActive = true;
            region.UpdatedAt = DateTime.UtcNow;

            var result = _regionRepository.Update(region);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> DeactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.REGION_ID_INVALID);

            var existingResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.REGION_NOT_FOUND);

            var region = existingResult.Value;
            region.IsActive = false;
            region.UpdatedAt = DateTime.UtcNow;

            var result = _regionRepository.Update(region);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    private static RegionDto MapToDto(Region region)
    {
        return new RegionDto
        {
            Id = region.Id,
            Name = region.Name,
            ParentId = region.ParentId,
            ParentName = region.Parent?.Name,
            IsActive = region.IsActive,
            CreatedAt = region.CreatedAt,
            UpdatedAt = region.UpdatedAt,
            Children = new List<RegionDto>(),
            Localizations = new List<LocalizedRegionDto>()
        };
    }

    private RegionHierarchyDto BuildRegionTree(Region region, List<Region> allRegions, int level)
    {
        var treeNode = new RegionHierarchyDto
        {
            Id = region.Id,
            Name = region.Name,
            Level = level,
            Children = new List<RegionHierarchyDto>()
        };

        // Find children of current region
        var children = allRegions.Where(r => r.ParentId == region.Id).ToList();
        
        foreach (var child in children)
        {
            var childNode = BuildRegionTree(child, allRegions, level + 1);
            treeNode.Children.Add(childNode);
        }

        return treeNode;
    }
}
