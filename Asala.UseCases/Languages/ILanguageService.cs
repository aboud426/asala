using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages.DTOs;

namespace Asala.UseCases.Languages;

public interface ILanguageService
{
    Task<Result<PaginatedResult<LanguageDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<LanguageDto>> CreateAsync(
        CreateLanguageDto createDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<LanguageDto?>> UpdateAsync(
        int id,
        UpdateLanguageDto updateDto,
        CancellationToken cancellationToken = default
    );
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<LanguageDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );
}
