using Asala.Core.Modules.Languages.DTOs;
using Asala.UseCases.Languages;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/languages")]
public class LanguageController : BaseController
{
    private readonly ILanguageService _languageService;

    public LanguageController(ILanguageService languageService)
        : base()
    {
        _languageService = languageService;
    }

    [HttpGet]
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

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _languageService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateLanguageDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateLanguageDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
