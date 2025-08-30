using System.Linq.Expressions;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Languages.DTOs;

namespace Asala.UseCases.Languages;

public class LanguageService : ILanguageService
{
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LanguageService(ILanguageRepository languageRepository, IUnitOfWork unitOfWork)
    {
        _languageRepository = languageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<LanguageDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Language, bool>> filter = activeOnly switch
        {
            true => l => l.IsActive && !l.IsDeleted, // Only active languages
            false => l => !l.IsActive && !l.IsDeleted, // Only inactive languages
            null => l => !l.IsDeleted, // All languages (both active and inactive)
        };

        var result = await _languageRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(l => l.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<LanguageDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<LanguageDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    private async Task<Result<bool>> ExistsByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    )
    {
        // Validate code
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<bool>(MessageCodes.LANGUAGE_CODE_REQUIRED);

        var normalizedCode = code.Trim().ToLowerInvariant();

        var result = await _languageRepository.AnyAsync(
            filter: l => l.Code == normalizedCode && !l.IsDeleted,
            cancellationToken
        );

        return result;
    }

    public async Task<Result<LanguageDto>> CreateAsync(
        CreateLanguageDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateLanguageDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<LanguageDto>(validationResult.MessageCode);

        // Normalize code to lowercase
        var normalizedCode = createDto.Code.Trim().ToLowerInvariant();

        // Check if language with the same code already exists
        var existsResult = await ExistsByCodeAsync(normalizedCode, cancellationToken);
        if (existsResult.IsFailure)
            return Result.Failure<LanguageDto>(existsResult.MessageCode);

        if (existsResult.Value)
            return Result.Failure<LanguageDto>(MessageCodes.LANGUAGE_CODE_ALREADY_EXISTS);

        var language = new Language
        {
            Name = createDto.Name.Trim(),
            Code = normalizedCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var addResult = await _languageRepository.AddAsync(language, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<LanguageDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<LanguageDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<LanguageDto?>> UpdateAsync(
        int id,
        UpdateLanguageDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<LanguageDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateLanguageDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<LanguageDto?>(validationResult.MessageCode);

        var getResult = await _languageRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<LanguageDto?>(getResult.MessageCode);

        var language = getResult.Value;
        if (language == null)
            return Result.Success<LanguageDto?>(null);

        // Normalize code to lowercase
        var normalizedCode = updateDto.Code.Trim().ToLowerInvariant();

        // Check if another language with the same code exists (excluding current language)
        var existsResult = await _languageRepository.AnyAsync(
            filter: l => l.Code == normalizedCode && l.Id != id && !l.IsDeleted,
            cancellationToken
        );

        if (existsResult.IsFailure)
            return Result.Failure<LanguageDto?>(existsResult.MessageCode);

        if (existsResult.Value)
            return Result.Failure<LanguageDto?>(MessageCodes.LANGUAGE_CODE_ALREADY_EXISTS);

        language.Name = updateDto.Name.Trim();
        language.Code = normalizedCode;
        language.IsActive = updateDto.IsActive;
        language.UpdatedAt = DateTime.UtcNow;

        var updateResult = _languageRepository.Update(language);
        if (updateResult.IsFailure)
            return Result.Failure<LanguageDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<LanguageDto?>(saveResult.MessageCode);

        var dto = MapToDto(language);
        return Result.Success<LanguageDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _languageRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var language = getResult.Value;
        if (language == null)
            return Result.Failure(MessageCodes.LANGUAGE_NOT_FOUND);

        language.IsDeleted = true;
        language.DeletedAt = DateTime.UtcNow;
        language.UpdatedAt = DateTime.UtcNow;

        var updateResult = _languageRepository.Update(language);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _languageRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var language = getResult.Value;
        if (language == null)
            return Result.Failure(MessageCodes.LANGUAGE_NOT_FOUND);

        language.IsActive = !language.IsActive;
        language.UpdatedAt = DateTime.UtcNow;

        var updateResult = _languageRepository.Update(language);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<LanguageDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageRepository.GetAsync(
            filter: l => l.IsActive && !l.IsDeleted,
            orderBy: q => q.OrderBy(l => l.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<LanguageDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<LanguageDropdownDto>>(dtos);
    }

    #region Validation Methods

    /// <summary>
    /// Validates pagination parameters
    /// </summary>
    private static Result ValidatePagination(int page, int pageSize)
    {
        if (page < 1)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize < 1 || pageSize > 100)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        return Result.Success();
    }

    /// <summary>
    /// Validates entity ID
    /// </summary>
    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.LANGUAGE_ID_INVALID);

        return Result.Success();
    }

    /// <summary>
    /// Validates CreateLanguageDto input
    /// </summary>
    private static Result ValidateCreateLanguageDto(CreateLanguageDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.LANGUAGE_NAME_REQUIRED);

        if (createDto.Name.Length > 100)
            return Result.Failure(MessageCodes.LANGUAGE_NAME_TOO_LONG);

        // Validate Code
        if (string.IsNullOrWhiteSpace(createDto.Code))
            return Result.Failure(MessageCodes.LANGUAGE_CODE_REQUIRED);

        if (createDto.Code.Length > 10)
            return Result.Failure(MessageCodes.LANGUAGE_CODE_TOO_LONG);

        return Result.Success();
    }

    /// <summary>
    /// Validates UpdateLanguageDto input
    /// </summary>
    private static Result ValidateUpdateLanguageDto(UpdateLanguageDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.LANGUAGE_NAME_REQUIRED);

        if (updateDto.Name.Length > 100)
            return Result.Failure(MessageCodes.LANGUAGE_NAME_TOO_LONG);

        // Validate Code
        if (string.IsNullOrWhiteSpace(updateDto.Code))
            return Result.Failure(MessageCodes.LANGUAGE_CODE_REQUIRED);

        if (updateDto.Code.Length > 10)
            return Result.Failure(MessageCodes.LANGUAGE_CODE_TOO_LONG);

        // Language code format validation (2-5 letters, lowercase)
        if (!Regex.IsMatch(updateDto.Code.Trim(), @"^[a-z]{2,5}$"))
            return Result.Failure(MessageCodes.LANGUAGE_CODE_INVALID_FORMAT);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static LanguageDto MapToDto(Language language)
    {
        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name,
            Code = language.Code,
            IsActive = language.IsActive,
            CreatedAt = language.CreatedAt,
            UpdatedAt = language.UpdatedAt,
        };
    }

    private static LanguageDropdownDto MapToDropdownDto(Language language)
    {
        return new LanguageDropdownDto
        {
            Id = language.Id,
            Name = language.Name,
            Code = language.Code,
        };
    }

    #endregion
}
