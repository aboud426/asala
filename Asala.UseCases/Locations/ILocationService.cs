using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.DTOs;

namespace Asala.UseCases.Locations;

public interface ILocationService
{
    Task<Result<LocationDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<LocationDto>>> GetAllAsync(
        int page,
        int pageSize,
        int? userId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<LocationDto>>> GetByRegionAsync(
        int regionId,
        int page,
        int pageSize,
        bool? isActive = true,
        CancellationToken cancellationToken = default
    );
    Task<Result<List<LocationDropdownDto>>> GetDropdownAsync(
        bool? isActive = true,
        CancellationToken cancellationToken = default
    );
    Task<Result<List<LocationDropdownDto>>> GetDropdownByRegionAsync(
        int regionId,
        bool? isActive = true,
        CancellationToken cancellationToken = default
    );
    Task<Result<LocationDto>> CreateAsync(
        CreateLocationDto createDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<LocationDto?>> UpdateAsync(
        int id,
        UpdateLocationDto updateDto,
        CancellationToken cancellationToken = default
    );
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<int>>> GetLocationsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
    Task<Result<List<LocationDto>>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
}
