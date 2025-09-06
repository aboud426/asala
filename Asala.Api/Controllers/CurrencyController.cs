using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Currency management controller for handling currencies and their localizations
/// </summary>
[ApiController]
[Route("api/currencies")]
public class CurrencyController : BaseController
{
    private readonly ICurrencyService _currencyService;

    public CurrencyController(ICurrencyService currencyService)
        : base()
    {
        _currencyService = currencyService;
    }

    /// <summary>
    /// Get paginated list of currencies
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active currencies only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of currencies</returns>
    /// <response code="200">Currencies retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get currency details by ID
    /// </summary>
    /// <param name="id">Currency ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Currency details</returns>
    /// <response code="200">Currency found</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _currencyService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get currency details by name
    /// </summary>
    /// <param name="name">Currency name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Currency details</returns>
    /// <response code="200">Currency found</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetByName(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.GetByNameAsync(name, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get currency details by code
    /// </summary>
    /// <param name="code">Currency code (e.g., USD, EUR)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Currency details</returns>
    /// <response code="200">Currency found</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode(
        string code,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.GetByCodeAsync(code, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get currencies formatted for dropdown selection
    /// </summary>
    /// <param name="activeOnly">Filter by active currencies only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of currencies suitable for dropdown/select controls</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new currency
    /// </summary>
    /// <param name="createDto">Currency creation data including name, code, and symbol</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created currency details</returns>
    /// <response code="200">Currency created successfully</response>
    /// <response code="400">Invalid currency data or currency name/code already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCurrencyDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing currency
    /// </summary>
    /// <param name="id">Currency ID to update</param>
    /// <param name="updateDto">Updated currency data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated currency details</returns>
    /// <response code="200">Currency updated successfully</response>
    /// <response code="400">Invalid currency data or currency name/code already exists</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCurrencyDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle currency activation status (active/inactive)
    /// </summary>
    /// <param name="id">Currency ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Currency activation toggled successfully</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a currency (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Currency ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Currency deleted successfully</response>
    /// <response code="404">Currency not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get currencies that are missing translations for active languages
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of currency IDs that are missing translations</returns>
    /// <response code="200">Currency IDs missing translations retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("missing-translations")]
    public async Task<IActionResult> GetCurrenciesMissingTranslations(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyService.GetCurrenciesMissingTranslationsAsync(cancellationToken);
        return CreateResponse(result);
    }
}
