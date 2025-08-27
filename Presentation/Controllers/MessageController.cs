using Microsoft.AspNetCore.Mvc;
using Business.Services;
using Infrastructure.Common;
using Infrastructure.Models;
using Presentation.Extensions;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;

namespace Presentation.Controllers;

/// <summary>
/// Messages controller for managing localized messages
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MessageController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessageController(IMessageService messageService)
    {
        _messageService = messageService ?? throw new ArgumentNullException(nameof(messageService));
    }

    /// <summary>
    /// Get a message by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMessage(int id, CancellationToken cancellationToken)
    {
        var result = await _messageService.GetMessageByIdAsync(id, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get a message by code
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetMessageByCode(string code, CancellationToken cancellationToken)
    {
        var result = await _messageService.GetMessageByCodeAsync(code, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get paginated messages
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMessages(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            var validationResult = Result.Failure<PaginatedResult<Message>>(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.GetMessagesAsync(page, pageSize, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Create a new message with code
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateMessage(
        [FromBody] CreateMessageRequest request, 
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure<Message>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.CreateMessageAsync(
            request.Code,
            cancellationToken);

        if (result.IsSuccess)
        {
            var apiResponse = result.ToApiResponse();
            return CreatedAtAction(
                nameof(GetMessage), 
                new { id = result.Value!.Id }, 
                apiResponse);
        }

        return result.ToActionResult();
    }

    /// <summary>
    /// Add or update localized text for a message
    /// </summary>
    [HttpPost("{messageId}/localized")]
    public async Task<IActionResult> AddLocalizedMessage(
        int messageId,
        [FromBody] AddLocalizedMessageRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure<MessageLocalized>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.AddLocalizedMessageAsync(
            messageId,
            request.LanguageId,
            request.Text,
            cancellationToken);

        if (result.IsSuccess)
        {
            var apiResponse = result.ToApiResponse();
            return CreatedAtAction(
                nameof(GetMessage), 
                new { id = messageId }, 
                apiResponse);
        }

        return result.ToActionResult();
    }

    /// <summary>
    /// Get localized message by code and language
    /// </summary>
    [HttpGet("localized/{code}")]
    public async Task<IActionResult> GetLocalizedMessage(
        string code,
        [FromQuery] int languageId,
        CancellationToken cancellationToken)
    {
        if (languageId <= 0)
        {
            var validationResult = Result.Failure<string>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.GetLocalizedMessageAsync(code, languageId, cancellationToken);
        
        if (result.IsSuccess)
        {
            var response = new LocalizedMessageResponse
            {
                Code = code,
                LanguageId = languageId,
                Text = result.Value
            };
            var successResult = Result<LocalizedMessageResponse>.Success(response);
            return successResult.ToActionResult();
        }

        return result.ToActionResult();
    }
}

/// <summary>
/// Request models for API endpoints
/// </summary>
public class CreateMessageRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Code { get; set; } = string.Empty;
}

public class AddLocalizedMessageRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Language ID must be greater than 0")]
    public int LanguageId { get; set; }

    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Text { get; set; } = string.Empty;
}

/// <summary>
/// Response models for API endpoints
/// </summary>
public class LocalizedMessageResponse
{
    public string Code { get; set; } = string.Empty;
    public int LanguageId { get; set; }
    public string? Text { get; set; }
}