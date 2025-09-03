using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeeController : BaseController
{
    private readonly IEmployeeService _employeeService;
    private readonly IAuthenticationService _authenticationService;

    public EmployeeController(IEmployeeService employeeService, IAuthenticationService authenticationService) : base()
    {
        _employeeService = employeeService;
        _authenticationService = authenticationService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] CreateEmployeeDto createDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.CreateAsync(createDto, cancellationToken);
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
        var result = await _authenticationService.LoginEmployeeAsync(loginDto, cancellationToken);
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
        var result = await _employeeService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Modify(
        int id,
        [FromBody] UpdateEmployeeDto updateDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchByName(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        [FromQuery] EmployeeSortBy sortBy = EmployeeSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.SearchByNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
        return CreateResponse(result);
    }
}
