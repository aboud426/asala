using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Admin controller for managing providers with full control over user information and localization
/// </summary>
[ApiController]
[Route("api/admin/providers")]
public class AdminProviderController : BaseController
{
    private readonly IAdminService _adminService;

    public AdminProviderController(IAdminService adminService)
        : base()
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Create a new provider with user information and localization support (Admin only)
    /// </summary>
    /// <param name="createDto">Provider creation data including user details, business information, and localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created provider details with user information and localizations</returns>
    /// <response code="200">Provider created successfully</response>
    /// <response code="400">Invalid provider data, email already exists, or validation failed</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProviderByAdminDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _adminService.CreateProviderAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get paginated list of all providers with full details (Admin only)
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active status (optional)</param>
    /// <param name="parentId">Filter by parent provider ID (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of providers with full details including user information, localizations, and media</returns>
    /// <response code="200">Providers retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        [FromQuery] int? parentId = null,
        CancellationToken cancellationToken = default
    )
    {
        // Validate pagination parameters
        if (page < 1)
            page = 1;
        if (pageSize < 1)
            pageSize = 10;
        if (pageSize > 100)
            pageSize = 100; // Limit max page size

        var result = await _adminService.GetAllProvidersAsync(
            page,
            pageSize,
            activeOnly,
            parentId,
            cancellationToken
        );

        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing provider with user information and localization support (Admin only)
    /// </summary>
    /// <param name="id">Provider ID to update</param>
    /// <param name="updateDto">Provider update data including user details, business information, and localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated provider details with user information and localizations</returns>
    /// <response code="200">Provider updated successfully</response>
    /// <response code="400">Invalid provider data, email already exists, or validation failed</response>
    /// <response code="404">Provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] int id,
        [FromBody] UpdateProviderByAdminDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _adminService.UpdateProviderAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }
}
