using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/providers")]
public class ProviderController : BaseController
{
    private readonly IProviderService _providerService;
    private readonly IAuthenticationService _authenticationService;

    public ProviderController(IProviderService providerService, IAuthenticationService authenticationService) : base()
    {
        _providerService = providerService;
        _authenticationService = authenticationService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] CreateProviderDto createDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.CreateAsync(createDto, cancellationToken);
        if (result.IsFailure)
        {
            return CreateResponse(result);
        }

        // For now, return null token as requested
        var taken = null as string;
        
        var authResponse = new AuthResponseDto
        {
            Token = taken!,
            User = new UserDto
            {
                Id = result.Value!.UserId,
                Email = result.Value.Email,
                IsActive = result.Value.IsActive,
                CreatedAt = result.Value.CreatedAt,
                UpdatedAt = result.Value.UpdatedAt
            },
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        return CreateResponse(Core.Common.Models.Result.Success(authResponse));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _authenticationService.LoginProviderAsync(loginDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        // For now, just return success as no token handling is implemented
        return CreateResponse(Core.Common.Models.Result.Success());
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modify(
        int id,
        [FromBody] UpdateProviderDto updateDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchByBusinessName(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        [FromQuery] ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.SearchByBusinessNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetProviderTree(
        [FromQuery] int? rootId = null,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetProviderTreeAsync(rootId, languageCode, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("{id}/children")]
    public async Task<IActionResult> GetChildren(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetChildrenAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("{id}/localizations")]
    public async Task<IActionResult> GetLocalizations(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetLocalizationsAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
