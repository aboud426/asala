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
    private readonly ILocalizedRegionRepository _localizedRegionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegionService(IRegionRepository regionRepository, ILocalizedRegionRepository localizedRegionRepository, IUnitOfWork unitOfWork)
    {
        _regionRepository = regionRepository;
        _localizedRegionRepository = localizedRegionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RegionDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure<RegionDto?>(idValidationResult.MessageCode);

            var result = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (result.IsFailure)
                return Result.Failure<RegionDto?>(result.MessageCode);

            if (result.Value == null || result.Value.IsDeleted)
                return Result.Failure<RegionDto?>(MessageCodes.REGION_NOT_FOUND);

            var dto = MapToDto(result.Value);
            return Result.Success<RegionDto?>(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto?>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<RegionDto>>> GetAllAsync(
        int page,
        int pageSize,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    )
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

            var result = await _regionRepository.GetPaginatedWithLocalizationsAsync(
                page,
                pageSize,
                null,
                isActive,
                cancellationToken
            );
            if (result.IsFailure)
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

    public async Task<Result<List<RegionDropdownDto>>> GetDropdownAsync(
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
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

            var result = await _regionRepository.GetAsync(
                filter,
                orderBy: q => q.OrderBy(r => r.Name)
            );
            if (result.IsFailure)
                return Result.Failure<List<RegionDropdownDto>>(result.MessageCode);

            var dtos = result
                .Value.Select(x => new RegionDropdownDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    ParentId = x.ParentId,
                    FullPath = x.Name, // You can build full path logic here if needed
                })
                .ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<RegionDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<RegionHierarchyDto>>> GetRegionTreeAsync(
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
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

            var result = await _regionRepository.GetAsync(
                filter,
                orderBy: q => q.OrderBy(r => r.Name)
            );
            if (result.IsFailure)
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

    public async Task<Result<List<RegionDto>>> GetSubRegionsAsync(
        int parentId,
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate parent ID
            var idValidationResult = ValidateId(parentId);
            if (idValidationResult.IsFailure)
                return Result.Failure<List<RegionDto>>(idValidationResult.MessageCode);

            // Verify parent exists
            var parentResult = await _regionRepository.GetByIdAsync(parentId, cancellationToken);
            if (parentResult.IsFailure)
                return Result.Failure<List<RegionDto>>(parentResult.MessageCode);

            if (parentResult.Value == null)
                return Result.Failure<List<RegionDto>>(MessageCodes.REGION_NOT_FOUND);

            Expression<Func<Region, bool>> filter;
            if (isActive.HasValue)
            {
                filter = r =>
                    r.ParentId == parentId && r.IsActive == isActive.Value && !r.IsDeleted;
            }
            else
            {
                filter = r => r.ParentId == parentId && !r.IsDeleted;
            }

            var result = await _regionRepository.GetAsync(
                filter,
                orderBy: q => q.OrderBy(r => r.Name)
            );
            if (result.IsFailure)
                return Result.Failure<List<RegionDto>>(result.MessageCode);

            var dtos = result.Value.Select(MapToDto).ToList();
            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<RegionDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<RegionDto>> CreateAsync(
        CreateRegionDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate input DTO
            var validationResult = ValidateCreateRegionDto(createDto);
            if (validationResult.IsFailure)
                return Result.Failure<RegionDto>(validationResult.MessageCode);

            // Validate parent if provided
            if (createDto.ParentId.HasValue)
            {
                var parentResult = await _regionRepository.GetByIdAsync(
                    createDto.ParentId.Value,
                    cancellationToken
                );
                if (parentResult.IsFailure || parentResult.Value == null)
                    return Result.Failure<RegionDto>(MessageCodes.REGION_PARENT_NOT_FOUND);
            }

            // Check if name already exists at the same level
            var existingResult = await _regionRepository.GetFirstOrDefaultAsync(r =>
                r.Name == createDto.Name.Trim() && r.ParentId == createDto.ParentId && !r.IsDeleted
            );
            if (existingResult.IsSuccess && existingResult.Value != null)
                return Result.Failure<RegionDto>(MessageCodes.REGION_NAME_ALREADY_EXISTS);

            // Create entity
            var region = new Region
            {
                Name = createDto.Name.Trim(),
                ParentId = createDto.ParentId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LocalizedRegions = createDto
                    .Localizations.Select(x => new LocalizedRegion
                    {
                        LanguageId = x.LanguageId,
                        LocalizedName = x.LocalizedName,
                        IsActive = x.IsActive,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    })
                    .ToList(),
            };

            var addResult = await _regionRepository.AddAsync(region, cancellationToken);
            if (addResult.IsFailure)
                return Result.Failure<RegionDto>(addResult.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
                return Result.Failure<RegionDto>(saveResult.MessageCode);

            // var dto = MapToDto(addResult.Value);
            return Result.Success<RegionDto>(new RegionDto { Id = addResult.Value.Id });
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<RegionDto?>> UpdateAsync(
        int id,
        UpdateRegionDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure<RegionDto?>(idValidationResult.MessageCode);

            // Validate input DTO
            var validationResult = ValidateUpdateRegionDto(updateDto);
            if (validationResult.IsFailure)
                return Result.Failure<RegionDto?>(validationResult.MessageCode);

            // Get existing entity
            var existingResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (existingResult.IsFailure)
                return Result.Failure<RegionDto?>(existingResult.MessageCode);

            var region = existingResult.Value;
            if (region == null)
                return Result.Success<RegionDto?>(null);

            // Validate parent if provided (and different from current)
            if (updateDto.ParentId.HasValue && updateDto.ParentId != region.ParentId)
            {
                // Cannot set self as parent
                if (updateDto.ParentId == id)
                    return Result.Failure<RegionDto?>(
                        MessageCodes.REGION_CANNOT_BE_PARENT_OF_ITSELF
                    );

                // Check if parent exists
                var parentResult = await _regionRepository.GetByIdAsync(
                    updateDto.ParentId.Value,
                    cancellationToken
                );
                if (parentResult.IsFailure || parentResult.Value == null)
                    return Result.Failure<RegionDto?>(MessageCodes.REGION_PARENT_NOT_FOUND);
            }

            // Check if new name already exists at the same level (excluding current record)
            var nameCheckResult = await _regionRepository.GetFirstOrDefaultAsync(r =>
                r.Name == updateDto.Name.Trim()
                && r.ParentId == updateDto.ParentId
                && r.Id != id
                && !r.IsDeleted
            );
            if (nameCheckResult.IsSuccess && nameCheckResult.Value != null)
                return Result.Failure<RegionDto?>(MessageCodes.REGION_NAME_ALREADY_EXISTS);

            // Update properties
            region.Name = updateDto.Name.Trim();
            region.ParentId = updateDto.ParentId;
            region.IsActive = updateDto.IsActive;
            region.UpdatedAt = DateTime.UtcNow;

            // Handle localizations if provided
            if (updateDto.Localizations != null && updateDto.Localizations.Any())
            {
                // Get existing localizations for this region
                var existingLocalizationsResult = await _localizedRegionRepository.GetByRegionIdAsync(id, cancellationToken);
                if (existingLocalizationsResult.IsFailure)
                    return Result.Failure<RegionDto?>(existingLocalizationsResult.MessageCode);

                var existingLocalizations = existingLocalizationsResult.Value.ToList();

                foreach (var localizationDto in updateDto.Localizations)
                {
                    // Check if localization already exists for this language
                    var existingLocalization = existingLocalizations
                        .FirstOrDefault(l => l.LanguageId == localizationDto.LanguageId);

                    if (existingLocalization != null)
                    {
                        // Update existing localization
                        existingLocalization.LocalizedName = localizationDto.LocalizedName.Trim();
                        existingLocalization.IsActive = localizationDto.IsActive;
                        existingLocalization.UpdatedAt = DateTime.UtcNow;

                        var updateLocalizationResult = _localizedRegionRepository.Update(existingLocalization);
                        if (updateLocalizationResult.IsFailure)
                            return Result.Failure<RegionDto?>(updateLocalizationResult.MessageCode);
                    }
                    else
                    {
                        // Create new localization
                        var newLocalization = new LocalizedRegion
                        {
                            RegionId = id,
                            LanguageId = localizationDto.LanguageId,
                            LocalizedName = localizationDto.LocalizedName.Trim(),
                            IsActive = localizationDto.IsActive,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        var addLocalizationResult = await _localizedRegionRepository.AddAsync(newLocalization, cancellationToken);
                        if (addLocalizationResult.IsFailure)
                            return Result.Failure<RegionDto?>(addLocalizationResult.MessageCode);
                    }
                }
            }

            var updateResult = _regionRepository.Update(region);
            if (updateResult.IsFailure)
                return Result.Failure<RegionDto?>(updateResult.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
                return Result.Failure<RegionDto?>(saveResult.MessageCode);

            // Get the updated region with its localizations to ensure we return the complete data
            var updatedRegionResult = await _regionRepository.GetByIdWithLocalizationsAsync(id, cancellationToken);
            if (updatedRegionResult.IsFailure)
                return Result.Failure<RegionDto?>(updatedRegionResult.MessageCode);

            var updatedRegion = updatedRegionResult.Value;
            if (updatedRegion == null)
                return Result.Success<RegionDto?>(null);

            // var dto = MapToDto(updatedRegion);
            return Result.Success<RegionDto?>(new RegionDto { Id = updatedRegion.Id });
        }
        catch (Exception ex)
        {
            return Result.Failure<RegionDto?>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure(idValidationResult.MessageCode);

            // Get existing entity
            var getResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (getResult.IsFailure)
                return getResult;

            var region = getResult.Value;
            if (region == null)
                return Result.Failure(MessageCodes.REGION_NOT_FOUND);

            // Check if region has child regions
            var hasChildrenResult = await _regionRepository.AnyAsync(
                r => r.ParentId == id && !r.IsDeleted,
                cancellationToken
            );
            if (hasChildrenResult.IsFailure)
                return Result.Failure(hasChildrenResult.MessageCode);

            if (hasChildrenResult.Value)
                return Result.Failure(MessageCodes.REGION_HAS_CHILDREN_CANNOT_DELETE);

            // Soft delete
            region.IsDeleted = true;
            region.IsActive = false;
            region.DeletedAt = DateTime.UtcNow;
            region.UpdatedAt = DateTime.UtcNow;

            var updateResult = _regionRepository.Update(region);
            if (updateResult.IsFailure)
                return updateResult;

            return await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure(idValidationResult.MessageCode);

            var getResult = await _regionRepository.GetByIdAsync(id, cancellationToken);
            if (getResult.IsFailure)
                return getResult;

            var region = getResult.Value;
            if (region == null)
                return Result.Failure(MessageCodes.REGION_NOT_FOUND);

            region.IsActive = !region.IsActive;
            region.UpdatedAt = DateTime.UtcNow;

            var updateResult = _regionRepository.Update(region);
            if (updateResult.IsFailure)
                return updateResult;

            return await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetRegionsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await _regionRepository.GetRegionsMissingTranslationsAsync(cancellationToken);
    }

    #region Private Helper Methods

    private RegionHierarchyDto BuildRegionTree(Region region, List<Region> allRegions, int level)
    {
        var treeNode = new RegionHierarchyDto
        {
            Id = region.Id,
            Name = region.Name,
            Level = level,
            Children = new List<RegionHierarchyDto>(),
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

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.REGION_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateRegionDto(CreateRegionDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.REGION_NAME_REQUIRED);

        return Result.Success();
    }

    private static Result ValidateUpdateRegionDto(UpdateRegionDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.REGION_NAME_REQUIRED);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

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
            Children = [],
            Localizations = region
                .LocalizedRegions.Select(x => new LocalizedRegionDto
                {
                    Id = x.Id,
                    RegionId = x.RegionId,
                    LanguageId = x.LanguageId,
                    LocalizedName = x.LocalizedName,
                    LanguageName = x.Language.Name,
                    LanguageCode = x.Language.Code,
                    IsActive = x.IsActive,
                    CreatedAt = x.CreatedAt,
                })
                .ToList(),
        };
    }

    #endregion
}
