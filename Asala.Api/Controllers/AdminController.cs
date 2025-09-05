using Asala.Api.Controllers;
using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Administrative operations controller for managing users, customers, providers, and employees
/// </summary>
[Route("api/admin")]
[ApiController]
// [Authorize(Roles = "SuperAdmin,Admin")] // Commented out for now
public class AdminController : BaseController
{
    private readonly IAdminService _adminService;
    private readonly IUserService _userService;
    private readonly ICustomerService _customerService;
    private readonly IProviderService _providerService;
    private readonly IEmployeeService _employeeService;

    public AdminController(
        IAdminService adminService,
        IUserService userService,
        ICustomerService customerService,
        IProviderService providerService,
        IEmployeeService employeeService)
    {
        _adminService = adminService;
        _userService = userService;
        _customerService = customerService;
        _providerService = providerService;
        _employeeService = employeeService;
    }

    /// <summary>
    /// Admin login using email and password authentication
    /// </summary>
    /// <param name="loginDto">Admin login credentials including email and password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with admin details and access token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid credentials</response>
    /// <response code="401">Account is not active or insufficient permissions</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        var result = await _adminService.LoginAdminAsync(loginDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get paginated list of all users (admin access required)
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of all users across all user types</returns>
    /// <response code="200">Users retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetAllUsersAsync(page, pageSize, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get user details by ID (admin access required)
    /// </summary>
    /// <param name="userId">User ID to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Detailed user information including roles and permissions</returns>
    /// <response code="200">User found</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserById(int userId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetUserByIdAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Assign a role to a user (admin access required)
    /// </summary>
    /// <param name="userId">User ID to assign role to</param>
    /// <param name="roleId">Role ID to assign</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Role assigned successfully</response>
    /// <response code="404">User or role not found</response>
    /// <response code="400">Role already assigned to user</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("users/{userId}/roles/{roleId}")]
    // [Authorize(Roles = "SuperAdmin")] // Commented out for now
    public async Task<IActionResult> AssignRole(int userId, int roleId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.AssignRoleToUserAsync(userId, roleId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Remove a role from a user (admin access required)
    /// </summary>
    /// <param name="userId">User ID to remove role from</param>
    /// <param name="roleId">Role ID to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Role removed successfully</response>
    /// <response code="404">User or role not found</response>
    /// <response code="400">Role not assigned to user</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("users/{userId}/roles/{roleId}")]
    // [Authorize(Roles = "SuperAdmin")] // Commented out for now
    public async Task<IActionResult> RemoveRole(int userId, int roleId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.RemoveRoleFromUserAsync(userId, roleId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all roles assigned to a specific user (admin access required)
    /// </summary>
    /// <param name="userId">User ID to get roles for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of roles assigned to the user</returns>
    /// <response code="200">User roles retrieved successfully</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("users/{userId}/roles")]
    public async Task<IActionResult> GetUserRoles(int userId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetUserRolesAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all permissions for a specific user (admin access required)
    /// </summary>
    /// <param name="userId">User ID to get permissions for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of permissions granted to the user through roles</returns>
    /// <response code="200">User permissions retrieved successfully</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("users/{userId}/permissions")]
    public async Task<IActionResult> GetUserPermissions(int userId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetUserPermissionsAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle user activation status (admin access required)
    /// </summary>
    /// <param name="userId">User ID to toggle activation for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">User activation toggled successfully</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpPatch("users/{userId}/toggle-activation")]
    public async Task<IActionResult> ToggleUserActivation(int userId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.ToggleUserActivationAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a user (admin access required)
    /// </summary>
    /// <param name="userId">User ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">User deleted successfully</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Unauthorized access</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("users/{userId}")]
    // [Authorize(Roles = "SuperAdmin")] // Commented out for now
    public async Task<IActionResult> DeleteUser(int userId, CancellationToken cancellationToken = default)
    {
        var result = await _adminService.SoftDeleteUserAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    // Admin-specific user management endpoints
    [HttpGet("customers")]
    public async Task<IActionResult> GetAllCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _customerService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetAllProviders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetAllEmployees(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("customers/search")]
    public async Task<IActionResult> SearchCustomers(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        [FromQuery] CustomerSortBy sortBy = CustomerSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        var result = await _customerService.SearchByNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("providers/search")]
    public async Task<IActionResult> SearchProviders(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        [FromQuery] ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        var result = await _providerService.SearchByBusinessNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("employees/search")]
    public async Task<IActionResult> SearchEmployees(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = false,
        [FromQuery] EmployeeSortBy sortBy = EmployeeSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        var result = await _employeeService.SearchByNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
        return CreateResponse(result);
    }
}
