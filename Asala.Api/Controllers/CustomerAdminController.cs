using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Customer admin operations controller for managing customers from admin panel
/// </summary>
[ApiController]
[Route("api/admin/customers")]
// [Authorize] // Add appropriate authorization for admin operations
public class CustomerAdminController : BaseController
{
    private readonly ICustomerAdminService _customerAdminService;

    public CustomerAdminController(ICustomerAdminService customerAdminService)
        : base()
    {
        _customerAdminService = customerAdminService;
    }

    /// <summary>
    /// Get paginated list of customers (Admin)
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active customers only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of customers</returns>
    /// <response code="200">Customers retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get customer details by user ID (Admin)
    /// </summary>
    /// <param name="userId">The user ID of the customer</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Customer details</returns>
    /// <response code="200">Customer found</response>
    /// <response code="404">Customer not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetById(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.GetByUserIdAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new customer (Admin)
    /// </summary>
    /// <param name="createDto">Customer creation data without OTP requirement</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created customer details</returns>
    /// <response code="200">Customer created successfully</response>
    /// <response code="400">Invalid data or phone number already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCustomerAdminDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update customer information (Admin)
    /// </summary>
    /// <param name="userId">The user ID of the customer to update</param>
    /// <param name="updateDto">Updated customer data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated customer details</returns>
    /// <response code="200">Customer updated successfully</response>
    /// <response code="400">Invalid data or phone number already exists</response>
    /// <response code="404">Customer not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{userId}")]
    public async Task<IActionResult> Update(
        int userId,
        [FromBody] UpdateCustomerDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.UpdateAsync(userId, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a customer (Admin)
    /// </summary>
    /// <param name="userId">The user ID of the customer to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Customer deleted successfully</response>
    /// <response code="404">Customer not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{userId}")]
    public async Task<IActionResult> Delete(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.SoftDeleteAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle customer activation status (Admin)
    /// </summary>
    /// <param name="userId">The user ID of the customer to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Customer activation toggled successfully</response>
    /// <response code="404">Customer not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPatch("{userId}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.ToggleActivationAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get customers dropdown list (Admin)
    /// </summary>
    /// <param name="activeOnly">Filter by active customers only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of customers for dropdown</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerAdminService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }
}
