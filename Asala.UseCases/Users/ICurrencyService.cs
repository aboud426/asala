using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface ICurrencyService
{
    Task<Result<PaginatedResult<CurrencyDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<CurrencyDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<CurrencyDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<CurrencyDto?>> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    );

    Task<Result<CurrencyDto>> CreateAsync(
        CreateCurrencyDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<CurrencyDto?>> UpdateAsync(
        int id,
        UpdateCurrencyDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<CurrencyDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets currency IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetCurrenciesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
