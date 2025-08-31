using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : BaseController
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
        : base()
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.GetPaginatedAsync(
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
        var result = await _userService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetByEmail(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.GetByEmailAsync(email, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUserDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(
        int id,
        [FromBody] ChangePasswordDto changePasswordDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.ChangePasswordAsync(id, changePasswordDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _userService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
