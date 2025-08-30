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
/// Languages controller for managing application languages
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LanguageController : ControllerBase
{
    private readonly ILanguageService _languageService;

    public LanguageController(ILanguageService languageService)
    {
        _languageService = languageService ?? throw new ArgumentNullException(nameof(languageService));
    }

    /// <summary>
    /// Get a language by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLanguage(int id, CancellationToken cancellationToken)
    {
        var result = await _languageService.GetLanguageByIdAsync(id, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get a language by code
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetLanguageByCode(string code, CancellationToken cancellationToken)
    {
        var result = await _languageService.GetLanguageByCodeAsync(code, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get all languages
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllLanguages(CancellationToken cancellationToken)
    {
        var result = await _languageService.GetAllLanguagesAsync(cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get paginated languages
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetLanguages(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            var validationResult = Result.Failure<PaginatedResult<Language>>(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE);
            return validationResult.ToActionResult();
        }

        var result = await _languageService.GetLanguagesAsync(page, pageSize, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Create a new language
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateLanguage(
        [FromBody] CreateLanguageRequest request, 
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure<Language>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _languageService.CreateLanguageAsync(
            request.Name,
            request.Code,
            cancellationToken);

        if (result.IsSuccess)
        {
            var apiResponse = result.ToApiResponse();
            return CreatedAtAction(
                nameof(GetLanguage), 
                new { id = result.Value!.Id }, 
                apiResponse);
        }

        return result.ToActionResult();
    }

    /// <summary>
    /// Update an existing language
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLanguage(
        int id,
        [FromBody] UpdateLanguageRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        if (id <= 0)
        {
            var invalidIdResult = Result.Failure(ErrorCodes.LANGUAGE_INVALID_ID);
            return invalidIdResult.ToActionResult();
        }

        // Get the existing language first
        var existingLanguageResult = await _languageService.GetLanguageByIdAsync(id, cancellationToken);
        if (existingLanguageResult.IsFailure)
            return existingLanguageResult.ToActionResult();

        if (existingLanguageResult.Value == null)
        {
            var notFoundResult = Result.Failure(ErrorCodes.LANGUAGE_NOT_FOUND);
            return notFoundResult.ToActionResult();
        }

        // Update the language properties
        var language = existingLanguageResult.Value;
        language.Name = request.Name;
        language.Code = request.Code;

        var result = await _languageService.UpdateLanguageAsync(language, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Delete a language
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLanguage(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
        {
            var validationResult = Result.Failure(ErrorCodes.LANGUAGE_INVALID_ID);
            return validationResult.ToActionResult();
        }

        var result = await _languageService.DeleteLanguageAsync(id, cancellationToken);
        return result.ToActionResult();
    }
}

/// <summary>
/// Request models for API endpoints
/// </summary>
public class CreateLanguageRequest
{
    [Required]
    [StringLength(20, MinimumLength = 1, ErrorMessage = "Language name must be between 1 and 20 characters")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(3, MinimumLength = 2, ErrorMessage = "Language code must be 2-3 characters (e.g., 'en', 'es', 'fr')")]
    [RegularExpression(@"^[a-zA-Z]{2,3}$", ErrorMessage = "Language code must contain only letters")]
    public string Code { get; set; } = string.Empty;
}

public class UpdateLanguageRequest
{
    [Required]
    [StringLength(20, MinimumLength = 1, ErrorMessage = "Language name must be between 1 and 20 characters")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(3, MinimumLength = 2, ErrorMessage = "Language code must be 2-3 characters (e.g., 'en', 'es', 'fr')")]
    [RegularExpression(@"^[a-zA-Z]{2,3}$", ErrorMessage = "Language code must contain only letters")]
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Response models for API endpoints
/// </summary>
public class LanguageResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}