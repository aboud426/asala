using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Business.Common;

namespace Business.Services;

/// <summary>
/// Language service for managing application languages
/// </summary>
public interface ILanguageService
{
    Task<Result<Language?>> GetLanguageByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<Language?>> GetLanguageByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Language>>> GetAllLanguagesAsync(CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Language>>> GetLanguagesAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<Language>> CreateLanguageAsync(string name, string code, CancellationToken cancellationToken = default);
    Task<Result> UpdateLanguageAsync(Language language, CancellationToken cancellationToken = default);
    Task<Result> DeleteLanguageAsync(int id, CancellationToken cancellationToken = default);
}

public class LanguageService : ILanguageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;

    public LanguageService(IUnitOfWork unitOfWork, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<Result<Language?>> GetLanguageByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<Language?>(ErrorCodes.LANGUAGE_INVALID_ID);

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.Language(id),
            async () => await _unitOfWork.Languages.GetByIdAsync(id, cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<Language?>> GetLanguageByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Language?>(ErrorCodes.LANGUAGE_CODE_REQUIRED);

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.LanguageByCode(code),
            async () => 
            {
                var languages = await _unitOfWork.Languages.GetAsync(
                    filter: l => l.Code == code.Trim().ToLowerInvariant(), 
                    cancellationToken: cancellationToken);
                
                if (languages.IsFailure)
                    return Result.Failure<Language?>(languages.Error!);

                return Result<Language?>.Success(languages.Value?.FirstOrDefault());
            },
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<IEnumerable<Language>>> GetAllLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.ALL_LANGUAGES,
            async () => 
            {
                var result = await _unitOfWork.Languages.GetAsync(
                    orderBy: query => query.OrderBy(l => l.Name),
                    cancellationToken: cancellationToken);
                
                if (result.IsFailure)
                    return Result.Failure<IEnumerable<Language>>(result.Error!);

                return Result<IEnumerable<Language>>.Success(result.Value ?? Enumerable.Empty<Language>());
            },
            CacheHelper.ExpirationTimes.Long
        );
    }

    public async Task<Result<PaginatedResult<Language>>> GetLanguagesAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            CacheKeys.LanguagesByPaginated(page, pageSize),
            async () => await _unitOfWork.Languages.GetPaginatedAsync(
                page, 
                pageSize, 
                orderBy: query => query.OrderBy(l => l.Name),
                cancellationToken: cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<Language>> CreateLanguageAsync(string name, string code, CancellationToken cancellationToken = default)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Language>(ErrorCodes.LANGUAGE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Language>(ErrorCodes.LANGUAGE_CODE_REQUIRED);

        name = name.Trim();
        code = code.Trim().ToLowerInvariant();

        // Validate code format (ISO 639-1 or similar, e.g., "en", "es", "fr")
        if (!IsValidLanguageCode(code))
            return Result.Failure<Language>(ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT);

        // Check if language with this code already exists
        var existingByCodeResult = await GetLanguageByCodeAsync(code, cancellationToken);
        if (existingByCodeResult.IsFailure)
            return Result.Failure<Language>(existingByCodeResult.Error!);

        if (existingByCodeResult.Value != null)
            return Result.Failure<Language>(ErrorCodes.LANGUAGE_CODE_EXISTS);

        // Check if language with this name already exists
        var existingByNameResult = await _unitOfWork.Languages.GetAsync(
            filter: l => l.Name.ToLower() == name.ToLower(),
            cancellationToken: cancellationToken);

        if (existingByNameResult.IsFailure)
            return Result.Failure<Language>(existingByNameResult.Error!);

        if (existingByNameResult.Value?.Any() == true)
            return Result.Failure<Language>(ErrorCodes.LANGUAGE_NAME_EXISTS);

        // Create language
        var language = new Language
        {
            Name = name,
            Code = code,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var addResult = await _unitOfWork.Languages.AddAsync(language, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<Language>(addResult.Error!);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<Language>(saveResult.Error!);

        // Clear relevant caches
        InvalidateLanguageCaches();

        return Result<Language>.Success(language);
    }

    public async Task<Result> UpdateLanguageAsync(Language language, CancellationToken cancellationToken = default)
    {
        if (language == null)
            return Result.Failure(ErrorCodes.VALIDATION_REQUIRED_FIELD);

        if (string.IsNullOrWhiteSpace(language.Name))
            return Result.Failure(ErrorCodes.LANGUAGE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(language.Code))
            return Result.Failure(ErrorCodes.LANGUAGE_CODE_REQUIRED);

        // Validate code format
        if (!IsValidLanguageCode(language.Code.Trim()))
            return Result.Failure(ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT);

        // Check if language exists
        var existingLanguageResult = await GetLanguageByIdAsync(language.Id, cancellationToken);
        if (existingLanguageResult.IsFailure)
            return Result.Failure(existingLanguageResult.Error!);

        if (existingLanguageResult.Value == null)
            return Result.Failure(ErrorCodes.LANGUAGE_NOT_FOUND);

        // Check for duplicate code (excluding current language)
        var duplicateCodeResult = await _unitOfWork.Languages.GetAsync(
            filter: l => l.Code.ToLower() == language.Code.Trim().ToLower() && l.Id != language.Id,
            cancellationToken: cancellationToken);

        if (duplicateCodeResult.IsFailure)
            return Result.Failure(duplicateCodeResult.Error!);

        if (duplicateCodeResult.Value?.Any() == true)
            return Result.Failure(ErrorCodes.LANGUAGE_CODE_EXISTS);

        // Check for duplicate name (excluding current language)
        var duplicateNameResult = await _unitOfWork.Languages.GetAsync(
            filter: l => l.Name.ToLower() == language.Name.Trim().ToLower() && l.Id != language.Id,
            cancellationToken: cancellationToken);

        if (duplicateNameResult.IsFailure)
            return Result.Failure(duplicateNameResult.Error!);

        if (duplicateNameResult.Value?.Any() == true)
            return Result.Failure(ErrorCodes.LANGUAGE_NAME_EXISTS);

        // Update language
        language.Name = language.Name.Trim();
        language.Code = language.Code.Trim().ToLowerInvariant();
        language.UpdatedAt = DateTime.UtcNow;

        var updateResult = _unitOfWork.Languages.Update(language);
        if (updateResult.IsFailure)
            return Result.Failure(updateResult.Error!);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error!);

        // Clear relevant caches
        InvalidateLanguageCaches();
        _cache.Remove(CacheKeys.Language(language.Id));

        return Result.Success();
    }

    public async Task<Result> DeleteLanguageAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure(ErrorCodes.LANGUAGE_INVALID_ID);

        // Check if language exists
        var languageResult = await GetLanguageByIdAsync(id, cancellationToken);
        if (languageResult.IsFailure)
            return Result.Failure(languageResult.Error!);

        if (languageResult.Value == null)
            return Result.Failure(ErrorCodes.LANGUAGE_NOT_FOUND);

        // Check if language has dependencies (localized content)
        var hasDependenciesResult = await CheckLanguageDependenciesAsync(id, cancellationToken);
        if (hasDependenciesResult.IsFailure)
            return Result.Failure(hasDependenciesResult.Error!);

        if (hasDependenciesResult.Value)
            return Result.Failure(ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION);

        var deleteResult = await _unitOfWork.Languages.RemoveByIdAsync(id, cancellationToken);
        if (deleteResult.IsFailure)
            return Result.Failure(deleteResult.Error!);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error!);

        // Clear relevant caches
        InvalidateLanguageCaches();
        _cache.Remove(CacheKeys.Language(id));

        return Result.Success();
    }

    /// <summary>
    /// Validates language code format (ISO 639-1 format: 2-3 lowercase letters)
    /// </summary>
    private static bool IsValidLanguageCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return false;

        // ISO 639-1 (2 letters) or ISO 639-2 (3 letters) format
        var regex = new Regex(@"^[a-z]{2,3}$", RegexOptions.Compiled);
        return regex.IsMatch(code.Trim().ToLowerInvariant());
    }

    /// <summary>
    /// Checks if language has dependencies that prevent deletion
    /// </summary>
    private async Task<Result<bool>> CheckLanguageDependenciesAsync(int languageId, CancellationToken cancellationToken)
    {
        try
        {
            // Check if language is used in any localized content
            // We'll check a few key tables to see if they reference this language

            // Check message localizations
            var messageLocalizedResult = await _unitOfWork.Repository<MessageLocalized>().AnyAsync(
                ml => ml.LanguageId == languageId,
                cancellationToken);

            if (messageLocalizedResult.IsFailure)
                return Result.Failure<bool>(messageLocalizedResult.Error!);

            if (messageLocalizedResult.Value)
                return Result<bool>.Success(true);

            // Check product localizations
            var productLocalizedResult = await _unitOfWork.Repository<ProductLocalized>().AnyAsync(
                pl => pl.LanguageId == languageId,
                cancellationToken);

            if (productLocalizedResult.IsFailure)
                return Result.Failure<bool>(productLocalizedResult.Error!);

            if (productLocalizedResult.Value)
                return Result<bool>.Success(true);

            return Result<bool>.Success(false);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>($"Error checking language dependencies: {ex.Message}");
        }
    }

    /// <summary>
    /// Invalidates all language-related caches
    /// </summary>
    private void InvalidateLanguageCaches()
    {
        _cache.Remove(CacheKeys.ALL_LANGUAGES);
        _cache.RemoveByPattern("language_");
        _cache.RemoveByPattern("languages_");
    }
}