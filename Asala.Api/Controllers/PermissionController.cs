using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/permissions")]
public class PermissionController : BaseController
{
    private readonly IPermissionService _permissionService;

    public PermissionController(IPermissionService permissionService)
        : base()
    {
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePermissionDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePermissionDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
