using System.ComponentModel;
using Asala.Api.Models;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages.DTOs;
using Asala.UseCases.Languages;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/languages")]
[OpenApiTag("Languages", Description = "Manage system languages and their configurations")]
public class LanguageController : BaseController
{
    private readonly ILanguageService _languageService;

    public LanguageController(ILanguageService languageService)
        : base()
    {
        _languageService = languageService;
    }

    /// <summary>
    /// Get paginated languages
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    ///  <param name="pageSize">Number of items per page (default: 5)</param>
    /// <param name="activeOnly">Filter by active status only</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of languages</returns>
    [HttpGet]
    [ProducesResponseType(
        typeof(ApiResponse<PaginatedResult<LanguageDto>>),
        StatusCodes.Status200OK
    )]
    [Description("Get paginated languages, to show in the datatable")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get languages dropdown
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Simplified list of active languages for dropdown controls</returns>
    [HttpGet("dropdown")]
    [ProducesResponseType(
        typeof(ApiResponse<IEnumerable<LanguageDropdownDto>>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _languageService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new language
    /// </summary>
    /// <param name="createDto">Language creation details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created language details</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LanguageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLanguageDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing language
    /// </summary>
    /// <param name="id">Language ID to update</param>
    /// <param name="updateDto">Updated language details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated language details</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LanguageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Update(
        [FromRoute] int id,
        [FromBody] UpdateLanguageDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle language activation status
    /// </summary>
    /// <param name="id">Language ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated language with new activation status</returns>
    [HttpPut("{id}/toggle-activation")]
    [ProducesResponseType(typeof(ApiResponse<LanguageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleActivation(
        [FromRoute] int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a language
    /// </summary>
    /// <param name="id">Language ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Confirmation of successful deletion</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SoftDelete(
        [FromRoute] int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
