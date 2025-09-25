using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages.DTOs;
using Microsoft.Extensions.Logging;

namespace Asala.UseCases.Languages;

/// <summary>
/// Service for seeding default languages (Arabic and English) into the database on startup
/// </summary>
public class LanguageSeederService
{
    private readonly ILanguageService _languageService;
    private readonly ILogger<LanguageSeederService> _logger;

    public LanguageSeederService(
        ILanguageService languageService,
        ILogger<LanguageSeederService> logger
    )
    {
        _languageService = languageService;
        _logger = logger;
    }

    /// <summary>
    /// Seeds default languages (Arabic and English) into the database
    /// </summary>
    public async Task<Result> SeedLanguagesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting Languages seeding process...");

            var defaultLanguages = new List<CreateLanguageDto>
            {
                new CreateLanguageDto
                {
                    Name = "English",
                    Code = "en"
                },
                new CreateLanguageDto
                {
                    Name = "Arabic",
                    Code = "ar"
                }
            };

            int seededCount = 0;
            int skippedCount = 0;

            foreach (var languageDto in defaultLanguages)
            {
                // Check if language already exists by trying to get it
                var existingLanguagesResult = await _languageService.GetPaginatedAsync(
                    page: 1,
                    pageSize: 1,
                    activeOnly: null,
                    cancellationToken
                );

                if (existingLanguagesResult.IsFailure)
                {
                    _logger.LogError(
                        "Error checking existing languages: {Error}",
                        existingLanguagesResult.MessageCode
                    );
                    continue;
                }

                // Check if this specific language code already exists
                bool languageExists = false;
                try
                {
                    var testCreateResult = await _languageService.CreateAsync(languageDto, cancellationToken);
                    if (testCreateResult.IsSuccess)
                    {
                        _logger.LogInformation("Successfully seeded language: {LanguageName} ({LanguageCode})", 
                            languageDto.Name, languageDto.Code);
                        seededCount++;
                    }
                    else if (testCreateResult.MessageCode == MessageCodes.LANGUAGE_CODE_ALREADY_EXISTS)
                    {
                        _logger.LogDebug("Language {LanguageName} ({LanguageCode}) already exists, skipping", 
                            languageDto.Name, languageDto.Code);
                        skippedCount++;
                    }
                    else
                    {
                        _logger.LogError(
                            "Failed to create language {LanguageName} ({LanguageCode}): {Error}",
                            languageDto.Name,
                            languageDto.Code,
                            testCreateResult.MessageCode
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, 
                        "Exception while creating language {LanguageName} ({LanguageCode})",
                        languageDto.Name, languageDto.Code);
                }
            }

            _logger.LogInformation(
                "Languages seeding completed. Seeded: {SeededCount}, Skipped: {SkippedCount}",
                seededCount,
                skippedCount
            );

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Languages seeding process");
            return Result.Failure(MessageCodes.EXECUTION_ERROR);
        }
    }
}
