using Asala.Core.Modules.Messages.DTOs;
using Asala.UseCases.Messages;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Message management controller for handling system messages with localization support
/// </summary>
[ApiController]
[Route("api/messages")]
public class MessageController : BaseController
{
    private readonly IMessageService _messageService;

    public MessageController(IMessageService messageService)
        : base()
    {
        _messageService = messageService;
    }

    /// <summary>
    /// Get paginated list of system messages
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active messages only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of messages with localization support</returns>
    /// <response code="200">Messages retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new system message with localization support
    /// </summary>
    /// <param name="createDto">Message creation data including key, content, and localized versions</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created message details</returns>
    /// <response code="200">Message created successfully</response>
    /// <response code="400">Invalid message data or message key already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateMessageDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing system message
    /// </summary>
    /// <param name="id">Message ID to update</param>
    /// <param name="updateDto">Updated message data including localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated message details</returns>
    /// <response code="200">Message updated successfully</response>
    /// <response code="400">Invalid message data</response>
    /// <response code="404">Message not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateMessageDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle message activation status (active/inactive)
    /// </summary>
    /// <param name="id">Message ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Message activation toggled successfully</response>
    /// <response code="404">Message not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a system message (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Message ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Message deleted successfully</response>
    /// <response code="404">Message not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
