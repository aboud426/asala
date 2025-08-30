using Microsoft.AspNetCore.Mvc;
using Business.Services;
using Infrastructure.Common;
using Infrastructure.Models;
using Presentation.Extensions;
using Presentation.Models;
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
        if (result.IsSuccess && result.Value != null)
        {
            var dto = result.Value.ToDto();
            var successResult = Result<MessageDto>.Success(dto);
            return successResult.ToActionResult();
        }
        return result.ToActionResult();
    }

    /// <summary>
    /// Get a message by code
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetMessageByCode(string code, CancellationToken cancellationToken)
    {
        var result = await _messageService.GetMessageByCodeAsync(code, cancellationToken);
        if (result.IsSuccess && result.Value != null)
        {
            var dto = result.Value.ToDto();
            var successResult = Result<MessageDto>.Success(dto);
            return successResult.ToActionResult();
        }
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
            var validationResult = Result.Failure<PaginatedMessagesDto>(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.GetMessagesAsync(page, pageSize, cancellationToken);
        if (result.IsSuccess)
        {
            var dto = result.Value!.ToDto();
            var successResult = Result<PaginatedMessagesDto>.Success(dto);
            return successResult.ToActionResult();
        }
        return result.ToActionResult();
    }

    /// <summary>
    /// Get paginated messages with localizations for a specific language
    /// </summary>
    [HttpGet("with-localizations")]
    public async Task<IActionResult> GetMessagesWithLocalizations(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string languageCode = "en", // Default to English
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            var validationResult = Result.Failure<PaginatedMessagesDto>(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE);
            return validationResult.ToActionResult();
        }

        if (string.IsNullOrWhiteSpace(languageCode))
        {
            var validationResult = Result.Failure<PaginatedMessagesDto>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.GetMessagesWithLocalizationsAsync(page, pageSize, languageCode, cancellationToken);
        if (result.IsSuccess)
        {
            var dto = result.Value!.ToDto();
            var successResult = Result<PaginatedMessagesDto>.Success(dto);
            return successResult.ToActionResult();
        }
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
            var validationResult = Result.Failure<MessageDto>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.CreateMessageAsync(
            request.Code,
            cancellationToken);

        if (result.IsSuccess)
        {
            var dto = result.Value!.ToDto();
            var successResult = Result<MessageDto>.Success(dto);
            var apiResponse = successResult.ToApiResponse();
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
            var validationResult = Result.Failure<MessageLocalizedDto>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.AddLocalizedMessageByLanguageCodeAsync(
            messageId,
            request.LanguageCode,
            request.Text,
            cancellationToken);

        if (result.IsSuccess)
        {
            var dto = result.Value!.ToDto();
            var successResult = Result<MessageLocalizedDto>.Success(dto);
            var apiResponse = successResult.ToApiResponse();
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
        [FromQuery] string languageCode = "en", // Default to English
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
        {
            var validationResult = Result.Failure<string>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);
            return validationResult.ToActionResult();
        }

        var result = await _messageService.GetLocalizedMessageByLanguageCodeAsync(code, languageCode, cancellationToken);
        
        if (result.IsSuccess)
        {
            var response = new LocalizedMessageResponse
            {
                Code = code,
                LanguageCode = languageCode,
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
    [StringLength(10, MinimumLength = 2, ErrorMessage = "Language code must be between 2 and 10 characters")]
    public string LanguageCode { get; set; } = string.Empty;

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
    public string LanguageCode { get; set; } = string.Empty;
    public string? Text { get; set; }
}