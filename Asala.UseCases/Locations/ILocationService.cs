using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.DTOs;

namespace Asala.UseCases.Locations;

public interface ILocationService
{
    Task<Result<LocationDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<LocationDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<LocationDto>>> GetByRegionAsync(int regionId, int page, int pageSize, bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<List<LocationDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<List<LocationDropdownDto>>> GetDropdownByRegionAsync(int regionId, bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<LocationDto>> CreateAsync(CreateLocationDto createDto, CancellationToken cancellationToken = default);
    Task<Result<LocationDto>> UpdateAsync(int id, UpdateLocationDto updateDto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(int id, CancellationToken cancellationToken = default);
}
