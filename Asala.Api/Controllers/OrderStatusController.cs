using Asala.Core.Modules.Shopping.DTOs;
using Asala.UseCases.Shopping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderStatusController : BaseController
{
    private readonly IOrderStatusService _orderStatusService;

    public OrderStatusController(IOrderStatusService orderStatusService)
    {
        _orderStatusService = orderStatusService;
    }

    /// <summary>
    /// Get order status by ID
    /// </summary>
    /// <param name="id">Order status ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Order status details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all order statuses with pagination
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="isActive">Filter by active status (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of order statuses</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.GetAllAsync(page, pageSize, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get order statuses dropdown list
    /// </summary>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of order statuses for dropdown</returns>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown([FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.GetDropdownAsync(isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new order status
    /// </summary>
    /// <param name="createDto">Order status creation data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created order status</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderStatusDto createDto, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing order status
    /// </summary>
    /// <param name="id">Order status ID</param>
    /// <param name="updateDto">Order status update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated order status</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOrderStatusDto updateDto, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete an order status (soft delete)
    /// </summary>
    /// <param name="id">Order status ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.DeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Activate an order status
    /// </summary>
    /// <param name="id">Order status ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.ActivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Deactivate an order status
    /// </summary>
    /// <param name="id">Order status ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _orderStatusService.DeactivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
