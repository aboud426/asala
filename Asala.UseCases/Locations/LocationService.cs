using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Locations.DTOs;
using Asala.Core.Modules.Locations.Models;

namespace Asala.UseCases.Locations;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _locationRepository;
    private readonly IRegionRepository _regionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LocationService(ILocationRepository locationRepository, IRegionRepository regionRepository, IUnitOfWork unitOfWork)
    {
        _locationRepository = locationRepository;
        _regionRepository = regionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_ID_INVALID);

            var result = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<LocationDto>(result.MessageCode);

            if (result.Value == null)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NOT_FOUND);

            var dto = await MapToDtoAsync(result.Value, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<LocationDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<Location, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = l => l.IsActive == isActive.Value && !l.IsDeleted;
            }
            else
            {
                filter = l => !l.IsDeleted;
            }

            var result = await _locationRepository.GetPaginatedAsync(page, pageSize, filter, orderBy: q => q.OrderBy(l => l.Name));
            if (!result.IsSuccess)
                return Result.Failure<PaginatedResult<LocationDto>>(result.MessageCode);

            var dtos = new List<LocationDto>();
            foreach (var location in result.Value.Items)
            {
                var dto = await MapToDtoAsync(location, cancellationToken);
                dtos.Add(dto);
            }

            var paginatedResult = new PaginatedResult<LocationDto>(
                dtos,
                result.Value.TotalCount,
                result.Value.Page,
                result.Value.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<LocationDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<LocationDto>>> GetByRegionAsync(int regionId, int page, int pageSize, bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            if (regionId <= 0)
                return Result.Failure<PaginatedResult<LocationDto>>(MessageCodes.REGION_ID_INVALID);

            // Verify region exists
            var regionResult = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
            if (!regionResult.IsSuccess)
                return Result.Failure<PaginatedResult<LocationDto>>(regionResult.MessageCode);

            if (regionResult.Value == null)
                return Result.Failure<PaginatedResult<LocationDto>>(MessageCodes.REGION_NOT_FOUND);

            Expression<Func<Location, bool>> filter;
            if (isActive.HasValue)
            {
                filter = l => l.RegionId == regionId && l.IsActive == isActive.Value && !l.IsDeleted;
            }
            else
            {
                filter = l => l.RegionId == regionId && !l.IsDeleted;
            }

            var result = await _locationRepository.GetPaginatedAsync(page, pageSize, filter, orderBy: q => q.OrderBy(l => l.Name));
            if (!result.IsSuccess)
                return Result.Failure<PaginatedResult<LocationDto>>(result.MessageCode);

            var dtos = new List<LocationDto>();
            foreach (var location in result.Value.Items)
            {
                var dto = await MapToDtoAsync(location, cancellationToken);
                dtos.Add(dto);
            }

            var paginatedResult = new PaginatedResult<LocationDto>(
                dtos,
                result.Value.TotalCount,
                result.Value.Page,
                result.Value.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<LocationDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<LocationDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<Location, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = l => l.IsActive == isActive.Value && !l.IsDeleted;
            }
            else
            {
                filter = l => !l.IsDeleted;
            }

            var result = await _locationRepository.GetAsync(filter, orderBy: q => q.OrderBy(l => l.Name), l => l.Region);
            if (!result.IsSuccess)
                return Result.Failure<List<LocationDropdownDto>>(result.MessageCode);

            var dtos = result.Value.Select(x => new LocationDropdownDto
            {
                Id = x.Id,
                Name = x.Name,
                RegionName = x.Region?.Name,
                DisplayName = $"{x.Name} - {x.Region?.Name}"
            }).ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<LocationDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<LocationDropdownDto>>> GetDropdownByRegionAsync(int regionId, bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            if (regionId <= 0)
                return Result.Failure<List<LocationDropdownDto>>(MessageCodes.REGION_ID_INVALID);

            // Verify region exists
            var regionResult = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
            if (!regionResult.IsSuccess)
                return Result.Failure<List<LocationDropdownDto>>(regionResult.MessageCode);

            if (regionResult.Value == null)
                return Result.Failure<List<LocationDropdownDto>>(MessageCodes.REGION_NOT_FOUND);

            Expression<Func<Location, bool>> filter;
            if (isActive.HasValue)
            {
                filter = l => l.RegionId == regionId && l.IsActive == isActive.Value && !l.IsDeleted;
            }
            else
            {
                filter = l => l.RegionId == regionId && !l.IsDeleted;
            }

            var result = await _locationRepository.GetAsync(filter, orderBy: q => q.OrderBy(l => l.Name), l => l.Region);
            if (!result.IsSuccess)
                return Result.Failure<List<LocationDropdownDto>>(result.MessageCode);

            var dtos = result.Value.Select(x => new LocationDropdownDto
            {
                Id = x.Id,
                Name = x.Name,
                RegionName = x.Region?.Name,
                DisplayName = $"{x.Name} - {x.Region?.Name}"
            }).ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<LocationDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<LocationDto>> CreateAsync(CreateLocationDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validation
            if (string.IsNullOrWhiteSpace(createDto.Name))
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NAME_REQUIRED);

            if (!createDto.RegionId.HasValue || createDto.RegionId <= 0)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_REGION_ID_REQUIRED);

            // Validate region exists
            var regionResult = await _regionRepository.GetByIdAsync(createDto.RegionId.Value, cancellationToken);
            if (!regionResult.IsSuccess || regionResult.Value == null)
                return Result.Failure<LocationDto>(MessageCodes.REGION_NOT_FOUND);

            // Check if name already exists in the same region
            var existingResult = await _locationRepository.GetFirstOrDefaultAsync(l => l.Name == createDto.Name.Trim() && l.RegionId == createDto.RegionId.Value && !l.IsDeleted);
            if (existingResult.IsSuccess && existingResult.Value != null)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NAME_ALREADY_EXISTS);

            // Create entity
            var location = new Location
            {
                Name = createDto.Name.Trim(),
                Latitude = createDto.Latitude,
                Longitude = createDto.Longitude,
                RegionId = createDto.RegionId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _locationRepository.AddAsync(location, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<LocationDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<LocationDto>(saveResult.MessageCode);

            var dto = await MapToDtoAsync(result.Value, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<LocationDto>> UpdateAsync(int id, UpdateLocationDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_ID_INVALID);

            if (string.IsNullOrWhiteSpace(updateDto.Name))
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NAME_REQUIRED);

            if (!updateDto.RegionId.HasValue || updateDto.RegionId <= 0)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_REGION_ID_REQUIRED);

            // Get existing entity
            var existingResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure<LocationDto>(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NOT_FOUND);

            var location = existingResult.Value;

            // Validate region exists
            var regionResult = await _regionRepository.GetByIdAsync(updateDto.RegionId.Value, cancellationToken);
            if (!regionResult.IsSuccess || regionResult.Value == null)
                return Result.Failure<LocationDto>(MessageCodes.REGION_NOT_FOUND);

            // Check if new name already exists in the same region (excluding current record)
            var nameCheckResult = await _locationRepository.GetFirstOrDefaultAsync(l => l.Name == updateDto.Name.Trim() && l.RegionId == updateDto.RegionId.Value && l.Id != id && !l.IsDeleted);
            if (nameCheckResult.IsSuccess && nameCheckResult.Value != null)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NAME_ALREADY_EXISTS);

            // Update properties
            location.Name = updateDto.Name.Trim();
            location.Latitude = updateDto.Latitude;
            location.Longitude = updateDto.Longitude;
            location.RegionId = updateDto.RegionId;
            location.IsActive = updateDto.IsActive;
            location.UpdatedAt = DateTime.UtcNow;

            var result = _locationRepository.Update(location);
            if (!result.IsSuccess)
                return Result.Failure<LocationDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<LocationDto>(saveResult.MessageCode);

            var dto = await MapToDtoAsync(result.Value, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.LOCATION_ID_INVALID);

            // Get existing entity
            var existingResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.LOCATION_NOT_FOUND);

            // For now, we'll skip the usage check since we don't have access to other repositories
            // In a real implementation, you would inject the necessary repositories to check usage

            // Soft delete
            var location = existingResult.Value;
            location.IsDeleted = true;
            location.IsActive = false;
            location.DeletedAt = DateTime.UtcNow;
            location.UpdatedAt = DateTime.UtcNow;

            var result = _locationRepository.Update(location);
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
                return Result.Failure(MessageCodes.LOCATION_ID_INVALID);

            var existingResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.LOCATION_NOT_FOUND);

            var location = existingResult.Value;
            location.IsActive = true;
            location.UpdatedAt = DateTime.UtcNow;

            var result = _locationRepository.Update(location);
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
                return Result.Failure(MessageCodes.LOCATION_ID_INVALID);

            var existingResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.LOCATION_NOT_FOUND);

            var location = existingResult.Value;
            location.IsActive = false;
            location.UpdatedAt = DateTime.UtcNow;

            var result = _locationRepository.Update(location);
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

    private async Task<LocationDto> MapToDtoAsync(Location location, CancellationToken cancellationToken)
    {
        var regionName = string.Empty;
        if (location.Region != null)
        {
            regionName = location.Region.Name;
        }
        else if (location.RegionId.HasValue)
        {
            var regionResult = await _regionRepository.GetByIdAsync(location.RegionId.Value, cancellationToken);
            if (regionResult.IsSuccess && regionResult.Value != null)
            {
                regionName = regionResult.Value.Name;
            }
        }

        return new LocationDto
        {
            Id = location.Id,
            Name = location.Name,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            RegionId = location.RegionId,
            RegionName = regionName,
            IsActive = location.IsActive,
            CreatedAt = location.CreatedAt,
            UpdatedAt = location.UpdatedAt,
            Localizations = new List<LocationLocalizedDto>()
        };
    }
}
