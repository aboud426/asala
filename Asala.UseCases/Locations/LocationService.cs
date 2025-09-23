using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Locations.DTOs;
using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Locations;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _locationRepository;
    private readonly ILocationLocalizedRepository _locationLocalizedRepository;
    private readonly IRegionRepository _regionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LocationService(
        ILocationRepository locationRepository,
        ILocationLocalizedRepository locationLocalizedRepository,
        IRegionRepository regionRepository,
        IUnitOfWork unitOfWork
    )
    {
        _locationRepository = locationRepository;
        _locationLocalizedRepository = locationLocalizedRepository;
        _regionRepository = regionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure<LocationDto?>(idValidationResult.MessageCode);

            var result = await _locationRepository
                .GetQueryable()
                .Where(l => l.Id == id && !l.IsDeleted)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Include(l => l.Region)
                .Include(l => l.User)
                .ThenInclude(u => u.Customer)
                .FirstOrDefaultAsync(cancellationToken);
            if (result == null)
                return Result.Failure<LocationDto?>(MessageCodes.LOCATION_NOT_FOUND);

            var dto = MapToDto(result);
            return Result.Success<LocationDto?>(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto?>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<LocationDto>>> GetAllAsync(
        int page,
        int pageSize,
        int? userId = null,
        int? regionId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var result = await _locationRepository.GetPaginatedWithDetailsAsync(
                page,
                pageSize,
                regionId,
                userId,
                isActive,
                cancellationToken
            );
            if (result.IsFailure)
                return Result.Failure<PaginatedResult<LocationDto>>(result.MessageCode);

            var dtos = result.Value.Items.Select(MapToDto).ToList();
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

    public async Task<Result<PaginatedResult<LocationDto>>> GetByRegionAsync(
        int regionId,
        int page,
        int pageSize,
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate region ID
            var idValidationResult = ValidateId(regionId);
            if (idValidationResult.IsFailure)
                return Result.Failure<PaginatedResult<LocationDto>>(idValidationResult.MessageCode);

            // Verify region exists
            var regionResult = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
            if (regionResult.IsFailure)
                return Result.Failure<PaginatedResult<LocationDto>>(regionResult.MessageCode);

            if (regionResult.Value == null)
                return Result.Failure<PaginatedResult<LocationDto>>(MessageCodes.REGION_NOT_FOUND);

            var result = await _locationRepository.GetPaginatedWithDetailsAsync(
                page,
                pageSize,
                regionId,
                null,
                isActive,
                cancellationToken
            );
            if (result.IsFailure)
                return Result.Failure<PaginatedResult<LocationDto>>(result.MessageCode);

            var dtos = result.Value.Items.Select(MapToDto).ToList();
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

    public async Task<Result<List<LocationDropdownDto>>> GetDropdownAsync(
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
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

            var result = await _locationRepository.GetAsync(
                filter,
                orderBy: q => q.OrderBy(l => l.Name),
                l => l.Region
            );
            if (result.IsFailure)
                return Result.Failure<List<LocationDropdownDto>>(result.MessageCode);

            var dtos = result
                .Value.Select(x => new LocationDropdownDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    RegionName = x.Region?.Name,
                    DisplayName = $"{x.Name} - {x.Region?.Name}",
                })
                .ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<LocationDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<LocationDropdownDto>>> GetDropdownByRegionAsync(
        int regionId,
        bool? isActive = true,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate region ID
            var idValidationResult = ValidateId(regionId);
            if (idValidationResult.IsFailure)
                return Result.Failure<List<LocationDropdownDto>>(idValidationResult.MessageCode);

            // Verify region exists
            var regionResult = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
            if (regionResult.IsFailure)
                return Result.Failure<List<LocationDropdownDto>>(regionResult.MessageCode);

            if (regionResult.Value == null)
                return Result.Failure<List<LocationDropdownDto>>(MessageCodes.REGION_NOT_FOUND);

            Expression<Func<Location, bool>> filter;
            if (isActive.HasValue)
            {
                filter = l =>
                    l.RegionId == regionId && l.IsActive == isActive.Value && !l.IsDeleted;
            }
            else
            {
                filter = l => l.RegionId == regionId && !l.IsDeleted;
            }

            var result = await _locationRepository.GetAsync(
                filter,
                orderBy: q => q.OrderBy(l => l.Name),
                l => l.Region
            );
            if (result.IsFailure)
                return Result.Failure<List<LocationDropdownDto>>(result.MessageCode);

            var dtos = result
                .Value.Select(x => new LocationDropdownDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    RegionName = x.Region?.Name,
                    DisplayName = $"{x.Name} - {x.Region?.Name}",
                })
                .ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<LocationDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<LocationDto>> CreateAsync(
        CreateLocationDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate input DTO
            var validationResult = ValidateCreateLocationDto(createDto);
            if (validationResult.IsFailure)
                return Result.Failure<LocationDto>(validationResult.MessageCode);

            // Validate region exists
            var regionResult = await _regionRepository.GetByIdAsync(
                createDto.RegionId!.Value,
                cancellationToken
            );
            if (regionResult.IsFailure || regionResult.Value == null)
                return Result.Failure<LocationDto>(MessageCodes.REGION_NOT_FOUND);

            // Check if name already exists in the same region
            var existingResult = await _locationRepository.GetFirstOrDefaultAsync(l =>
                l.Name == createDto.Name.Trim()
                && l.RegionId == createDto.RegionId.Value
                && !l.IsDeleted
            );
            if (existingResult.IsSuccess && existingResult.Value != null)
                return Result.Failure<LocationDto>(MessageCodes.LOCATION_NAME_ALREADY_EXISTS);

            // Create entity
            var location = new Location
            {
                Name = createDto.Name.Trim(),
                Latitude = createDto.Latitude,
                Longitude = createDto.Longitude,
                RegionId = createDto.RegionId,
                UserId = createDto.UserId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LocationLocalizeds = createDto
                    .Localizations.Select(x => new LocationLocalized
                    {
                        LanguageId = x.LanguageId,
                        LocalizedName = x.Name,
                        IsActive = x.IsActive,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    })
                    .ToList(),
            };

            var addResult = await _locationRepository.AddAsync(location, cancellationToken);
            if (addResult.IsFailure)
                return Result.Failure<LocationDto>(addResult.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
                return Result.Failure<LocationDto>(saveResult.MessageCode);

            // Return a simplified DTO for create operations
            return Result.Success(new LocationDto { Id = addResult.Value.Id });
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<LocationDto?>> UpdateAsync(
        int id,
        UpdateLocationDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate ID
            var idValidationResult = ValidateId(id);
            if (idValidationResult.IsFailure)
                return Result.Failure<LocationDto?>(idValidationResult.MessageCode);

            // Validate input DTO
            var validationResult = ValidateUpdateLocationDto(updateDto);
            if (validationResult.IsFailure)
                return Result.Failure<LocationDto?>(validationResult.MessageCode);

            // Get existing entity
            var existingResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (existingResult.IsFailure)
                return Result.Failure<LocationDto?>(existingResult.MessageCode);

            var location = existingResult.Value;
            if (location == null)
                return Result.Success<LocationDto?>(null);

            // Validate region exists
            var regionResult = await _regionRepository.GetByIdAsync(
                updateDto.RegionId!.Value,
                cancellationToken
            );
            if (regionResult.IsFailure || regionResult.Value == null)
                return Result.Failure<LocationDto?>(MessageCodes.REGION_NOT_FOUND);

            // Check if new name already exists in the same region (excluding current record)
            var nameCheckResult = await _locationRepository.GetFirstOrDefaultAsync(l =>
                l.Name == updateDto.Name.Trim()
                && l.RegionId == updateDto.RegionId.Value
                && l.Id != id
                && !l.IsDeleted
            );
            if (nameCheckResult.IsSuccess && nameCheckResult.Value != null)
                return Result.Failure<LocationDto?>(MessageCodes.LOCATION_NAME_ALREADY_EXISTS);

            // Update properties
            location.Name = updateDto.Name.Trim();
            location.Latitude = updateDto.Latitude;
            location.Longitude = updateDto.Longitude;
            location.RegionId = updateDto.RegionId;
            location.UserId = updateDto.UserId;
            location.IsActive = updateDto.IsActive;
            location.UpdatedAt = DateTime.UtcNow;

            // Handle localizations if provided
            if (updateDto.Localizations != null && updateDto.Localizations.Any())
            {
                // Get existing localizations for this location
                var existingLocalizationsResult =
                    await _locationLocalizedRepository.GetByLocationIdAsync(id, cancellationToken);
                if (existingLocalizationsResult.IsFailure)
                    return Result.Failure<LocationDto?>(existingLocalizationsResult.MessageCode);

                var existingLocalizations = existingLocalizationsResult.Value.ToList();

                foreach (var localizationDto in updateDto.Localizations)
                {
                    LocationLocalized? existingLocalization = null;

                    // If ID is provided, try to find by ID first
                    if (localizationDto.Id.HasValue && localizationDto.Id.Value > 0)
                    {
                        existingLocalization = existingLocalizations.FirstOrDefault(l =>
                            l.Id == localizationDto.Id.Value
                        );

                        // If ID was provided but localization not found, return error
                        if (existingLocalization == null)
                            return Result.Failure<LocationDto?>(
                                MessageCodes.LOCALIZATION_NOT_FOUND
                            );
                    }
                    else
                    {
                        // If no ID provided, check if localization already exists for this language
                        existingLocalization = existingLocalizations.FirstOrDefault(l =>
                            l.LanguageId == localizationDto.LanguageId
                        );
                    }

                    if (existingLocalization != null)
                    {
                        // Update existing localization
                        existingLocalization.LocalizedName = localizationDto.Name.Trim();
                        existingLocalization.LanguageId = localizationDto.LanguageId;
                        existingLocalization.IsActive = localizationDto.IsActive;
                        existingLocalization.UpdatedAt = DateTime.UtcNow;

                        var updateLocalizationResult = _locationLocalizedRepository.Update(
                            existingLocalization
                        );
                        if (updateLocalizationResult.IsFailure)
                            return Result.Failure<LocationDto?>(
                                updateLocalizationResult.MessageCode
                            );
                    }
                    else
                    {
                        // Create new localization (only when no ID is provided)
                        if (localizationDto.Id.HasValue && localizationDto.Id.Value > 0)
                            return Result.Failure<LocationDto?>(
                                MessageCodes.LOCALIZATION_NOT_FOUND
                            );

                        var newLocalization = new LocationLocalized
                        {
                            LocationId = id,
                            LanguageId = localizationDto.LanguageId,
                            LocalizedName = localizationDto.Name.Trim(),
                            IsActive = localizationDto.IsActive,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                        };

                        var addLocalizationResult = await _locationLocalizedRepository.AddAsync(
                            newLocalization,
                            cancellationToken
                        );
                        if (addLocalizationResult.IsFailure)
                            return Result.Failure<LocationDto?>(addLocalizationResult.MessageCode);
                    }
                }
            }

            var updateResult = _locationRepository.Update(location);
            if (updateResult.IsFailure)
                return Result.Failure<LocationDto?>(updateResult.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
                return Result.Failure<LocationDto?>(saveResult.MessageCode);

            // Get the updated location with its localizations to ensure we return the complete data
            var updatedLocationResult = await _locationRepository.GetByIdWithLocalizationsAsync(
                id,
                cancellationToken
            );
            if (updatedLocationResult.IsFailure)
                return Result.Failure<LocationDto?>(updatedLocationResult.MessageCode);

            var updatedLocation = updatedLocationResult.Value;
            if (updatedLocation == null)
                return Result.Success<LocationDto?>(null);

            // Return a simplified DTO for update operations
            return Result.Success<LocationDto?>(new LocationDto { Id = updatedLocation.Id });
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationDto?>(MessageCodes.EXECUTION_ERROR, ex);
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
            var getResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (getResult.IsFailure)
                return getResult;

            var location = getResult.Value;
            if (location == null)
                return Result.Failure(MessageCodes.LOCATION_NOT_FOUND);

            // For now, we'll skip the usage check since we don't have access to other repositories
            // In a real implementation, you would inject the necessary repositories to check usage

            // Soft delete
            location.IsDeleted = true;
            location.IsActive = false;
            location.DeletedAt = DateTime.UtcNow;
            location.UpdatedAt = DateTime.UtcNow;

            var updateResult = _locationRepository.Update(location);
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

            var getResult = await _locationRepository.GetByIdAsync(id, cancellationToken);
            if (getResult.IsFailure)
                return getResult;

            var location = getResult.Value;
            if (location == null)
                return Result.Failure(MessageCodes.LOCATION_NOT_FOUND);

            location.IsActive = !location.IsActive;
            location.UpdatedAt = DateTime.UtcNow;

            var updateResult = _locationRepository.Update(location);
            if (updateResult.IsFailure)
                return updateResult;

            return await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetLocationsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This should be implemented in the repository layer
            // For now, return an empty collection
            return Result.Success<IEnumerable<int>>(new List<int>());
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<LocationDto>>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate user ID
            var idValidationResult = ValidateId(userId);
            if (idValidationResult.IsFailure)
                return Result.Failure<List<LocationDto>>(idValidationResult.MessageCode);

            var result = await _locationRepository.GetByUserIdAsync(userId, cancellationToken);
            if (result.IsFailure)
                return Result.Failure<List<LocationDto>>(result.MessageCode);

            var dtos = result.Value.Select(MapToDto).ToList();
            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<LocationDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    #region Private Helper Methods

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.LOCATION_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateLocationDto(CreateLocationDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.LOCATION_NAME_REQUIRED);

        // Validate Region ID
        if (!createDto.RegionId.HasValue || createDto.RegionId <= 0)
            return Result.Failure(MessageCodes.LOCATION_REGION_ID_REQUIRED);

        // Validate User ID
        if (createDto.UserId <= 0)
            return Result.Failure(MessageCodes.LOCATION_USER_ID_REQUIRED);

        return Result.Success();
    }

    private static Result ValidateUpdateLocationDto(UpdateLocationDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.LOCATION_NAME_REQUIRED);

        // Validate Region ID
        if (!updateDto.RegionId.HasValue || updateDto.RegionId <= 0)
            return Result.Failure(MessageCodes.LOCATION_REGION_ID_REQUIRED);

        // Validate User ID
        if (updateDto.UserId <= 0)
            return Result.Failure(MessageCodes.LOCATION_USER_ID_REQUIRED);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static LocationDto MapToDto(Location location)
    {
        return new LocationDto
        {
            Id = location.Id,
            Name = location.Name,
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            RegionId = location.RegionId,
            RegionName = location.Region?.Name,
            RegionFullPath = location.Region?.Name, // You can build full path logic here if needed
            UserId = location.UserId,
            UserEmail = location.User?.Email,
            UserName =
                location.User?.Name
                ?? location.User?.Employee?.EmployeeName
                ?? location.User?.Provider?.BusinessName
                ?? "UnKnown",
            IsActive = location.IsActive,
            CreatedAt = location.CreatedAt,
            UpdatedAt = location.UpdatedAt,
            Localizations =
                location
                    .LocationLocalizeds?.Select(x => new LocationLocalizedDto
                    {
                        Id = x.Id,
                        LocationId = x.LocationId,
                        LanguageId = x.LanguageId,
                        Name = x.LocalizedName,
                        LanguageName = x.Language?.Name ?? string.Empty,
                        LanguageCode = x.Language?.Code ?? string.Empty,
                        IsActive = x.IsActive,
                        CreatedAt = x.CreatedAt,
                    })
                    .ToList() ?? new List<LocationLocalizedDto>(),
        };
    }

    #endregion
}
