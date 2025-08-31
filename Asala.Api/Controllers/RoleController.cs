using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/roles")]
public class RoleController : BaseController
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
        : base()
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetPaginatedAsync(
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
        var result = await _roleService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetByName(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetByNameAsync(name, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateRoleDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateRoleDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
