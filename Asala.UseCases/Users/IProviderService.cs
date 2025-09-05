using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IProviderService
{
    Task<Result<PaginatedResult<ProviderDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProviderDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProviderDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProviderDto>> CreateAsync(
        CreateProviderDto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProviderDto?>> UpdateAsync(
        int id,
        UpdateProviderDto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result<IEnumerable<ProviderDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<IEnumerable<ProviderTreeDto>>> GetProviderTreeAsync(
        int? rootId = null,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<PaginatedResult<ProviderDto>>> SearchByBusinessNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<IEnumerable<ProviderDto>>> GetChildrenAsync(
        int parentId,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<IEnumerable<ProviderLocalizedDto>>> GetLocalizationsAsync(
        int providerId,
        CancellationToken cancellationToken = default
    );
}
