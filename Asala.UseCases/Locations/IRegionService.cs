using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.DTOs;

namespace Asala.UseCases.Locations;

public interface IRegionService
{
    Task<Result<RegionDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<RegionDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Result<List<RegionDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<List<RegionHierarchyDto>>> GetRegionTreeAsync(bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<List<RegionDto>>> GetSubRegionsAsync(int parentId, bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<RegionDto>> CreateAsync(CreateRegionDto createDto, CancellationToken cancellationToken = default);
    Task<Result<RegionDto>> UpdateAsync(int id, UpdateRegionDto updateDto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(int id, CancellationToken cancellationToken = default);
}
