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

    /// <summary>
    /// Register a new employee using email and password authentication
    /// </summary>
    /// <param name="createDto">Employee registration data including name, email, and password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with user details (token will be null as requested)</returns>
    /// <response code="200">Employee registered successfully</response>
    /// <response code="400">Invalid data or email already exists</response>
    /// <response code="500">Internal server error</response>
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

    /// <summary>
    /// Authenticate employee using email and password
    /// </summary>
    /// <param name="loginDto">Login credentials including email and password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with user details and access token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid credentials</response>
    /// <response code="401">Account is not active</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _authenticationService.LoginEmployeeAsync(loginDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Logout employee (currently returns success as token handling is not implemented)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Logout successful</response>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        // For now, just return success as no token handling is implemented
        return CreateResponse(Core.Common.Models.Result.Success());
    }

    /// <summary>
    /// Get paginated list of employees
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active employees only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of employees</returns>
    /// <response code="200">Employees retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
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

    /// <summary>
    /// Get employee details by user ID
    /// </summary>
    /// <param name="id">The user ID of the employee</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Employee details</returns>
    /// <response code="200">Employee found</response>
    /// <response code="404">Employee not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update employee information
    /// </summary>
    /// <param name="id">The user ID of the employee to update</param>
    /// <param name="updateDto">Updated employee data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated employee details</returns>
    /// <response code="200">Employee updated successfully</response>
    /// <response code="400">Invalid data or email already exists</response>
    /// <response code="404">Employee not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Modify(
        int id,
        [FromBody] UpdateEmployeeDto updateDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete an employee (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">The user ID of the employee to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Employee deleted successfully</response>
    /// <response code="404">Employee not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Search employees by name with pagination and sorting
    /// </summary>
    /// <param name="searchTerm">Search term to match employee names (supports partial matching)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active employees only (default: true)</param>
    /// <param name="sortBy">Sort criteria (Name) (default: Name)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of matching employees</returns>
    /// <response code="200">Search completed successfully</response>
    /// <response code="400">Invalid search parameters</response>
    /// <response code="500">Internal server error</response>
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
