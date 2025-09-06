using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class CurrencyService : ICurrencyService
{
    private readonly ICurrencyRepository _currencyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CurrencyService(ICurrencyRepository currencyRepository, IUnitOfWork unitOfWork)
    {
        _currencyRepository = currencyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<CurrencyDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _currencyRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<CurrencyDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<CurrencyDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<CurrencyDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<CurrencyDto?>(idValidationResult.MessageCode);

        var result = await _currencyRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CurrencyDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<CurrencyDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<CurrencyDto?>(MessageCodes.CURRENCY_NAME_REQUIRED);

        var result = await _currencyRepository.GetByNameAsync(name, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CurrencyDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<CurrencyDto?>> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<CurrencyDto?>(MessageCodes.CURRENCY_CODE_REQUIRED);

        var result = await _currencyRepository.GetByCodeAsync(code, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CurrencyDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<CurrencyDto>> CreateAsync(
        CreateCurrencyDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateCurrencyDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<CurrencyDto>(validationResult.MessageCode);

        // Check if name already exists
        var nameExistsResult = await _currencyRepository.ExistsByNameAsync(
            createDto.Name,
            cancellationToken: cancellationToken
        );
        if (nameExistsResult.IsFailure)
            return Result.Failure<CurrencyDto>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<CurrencyDto>(MessageCodes.CURRENCY_NAME_ALREADY_EXISTS);

        // Check if code already exists
        var codeExistsResult = await _currencyRepository.ExistsByCodeAsync(
            createDto.Code,
            cancellationToken: cancellationToken
        );
        if (codeExistsResult.IsFailure)
            return Result.Failure<CurrencyDto>(codeExistsResult.MessageCode);

        if (codeExistsResult.Value)
            return Result.Failure<CurrencyDto>(MessageCodes.CURRENCY_CODE_ALREADY_EXISTS);

        var currency = new Currency
        {
            Name = createDto.Name.Trim(),
            Code = createDto.Code.Trim().ToUpper(),
            Symbol = createDto.Symbol.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Localizations = CreateLocalizations(createDto.Localizations),
        };

        var addResult = await _currencyRepository.AddAsync(currency, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<CurrencyDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CurrencyDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<CurrencyDto?>> UpdateAsync(
        int id,
        UpdateCurrencyDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<CurrencyDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateCurrencyDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<CurrencyDto?>(validationResult.MessageCode);

        // Check if name already exists (excluding current currency)
        var nameExistsResult = await _currencyRepository.ExistsByNameAsync(
            updateDto.Name,
            id,
            cancellationToken
        );
        if (nameExistsResult.IsFailure)
            return Result.Failure<CurrencyDto?>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<CurrencyDto?>(MessageCodes.CURRENCY_NAME_ALREADY_EXISTS);

        // Check if code already exists (excluding current currency)
        var codeExistsResult = await _currencyRepository.ExistsByCodeAsync(
            updateDto.Code,
            id,
            cancellationToken
        );
        if (codeExistsResult.IsFailure)
            return Result.Failure<CurrencyDto?>(codeExistsResult.MessageCode);

        if (codeExistsResult.Value)
            return Result.Failure<CurrencyDto?>(MessageCodes.CURRENCY_CODE_ALREADY_EXISTS);

        var getResult = await _currencyRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<CurrencyDto?>(getResult.MessageCode);

        var currency = getResult.Value;
        if (currency == null)
            return Result.Success<CurrencyDto?>(null);

        currency.Name = updateDto.Name.Trim();
        currency.Code = updateDto.Code.Trim().ToUpper();
        currency.Symbol = updateDto.Symbol.Trim();
        currency.IsActive = updateDto.IsActive;
        currency.UpdatedAt = DateTime.UtcNow;

        // Handle localizations
        UpdateLocalizations(currency, updateDto.Localizations);

        var updateResult = _currencyRepository.Update(currency);
        if (updateResult.IsFailure)
            return Result.Failure<CurrencyDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CurrencyDto?>(saveResult.MessageCode);

        var dto = MapToDto(currency);
        return Result.Success<CurrencyDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _currencyRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var currency = getResult.Value;
        if (currency == null)
            return Result.Failure(MessageCodes.CURRENCY_NOT_FOUND);

        // Soft delete currency and all localizations
        currency.IsDeleted = true;
        currency.DeletedAt = DateTime.UtcNow;
        currency.UpdatedAt = DateTime.UtcNow;

        foreach (var localization in currency.Localizations)
        {
            localization.IsDeleted = true;
            localization.DeletedAt = DateTime.UtcNow;
            localization.UpdatedAt = DateTime.UtcNow;
        }

        var updateResult = _currencyRepository.Update(currency);
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

        var getResult = await _currencyRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var currency = getResult.Value;
        if (currency == null)
            return Result.Failure(MessageCodes.CURRENCY_NOT_FOUND);

        currency.IsActive = !currency.IsActive;
        currency.UpdatedAt = DateTime.UtcNow;

        var updateResult = _currencyRepository.Update(currency);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<CurrencyDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Currency, bool>> filter = BuildFilter(activeOnly);

        var result = await _currencyRepository.GetAsync(
            filter: filter,
            orderBy: q => q.OrderBy(c => c.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<CurrencyDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<CurrencyDropdownDto>>(dtos);
    }

    public async Task<Result<IEnumerable<int>>> GetCurrenciesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        // Delegate to the optimized repository method that uses efficient SQL joins
        return await _currencyRepository.GetCurrenciesMissingTranslationsAsync(cancellationToken);
    }

    #region Private Helper Methods

    private static Expression<Func<Currency, bool>> BuildFilter(bool activeOnly)
    {
        return c => !c.IsDeleted && (!activeOnly || c.IsActive);
    }

    private static List<CurrencyLocalized> CreateLocalizations(
        List<CreateCurrencyLocalizedDto> localizationDtos
    )
    {
        return localizationDtos
            .Select(dto => new CurrencyLocalized
            {
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim().ToUpper(),
                Symbol = dto.Symbol.Trim(),
                LanguageId = dto.LanguageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();
    }

    private static void UpdateLocalizations(
        Currency currency,
        List<UpdateCurrencyLocalizedDto> localizationDtos
    )
    {
        var now = DateTime.UtcNow;

        // Handle existing localizations
        foreach (var existingLocalization in currency.Localizations)
        {
            var updatedDto = localizationDtos.FirstOrDefault(dto =>
                dto.Id == existingLocalization.Id
            );
            if (updatedDto != null)
            {
                // Update existing localization
                existingLocalization.Name = updatedDto.Name.Trim();
                existingLocalization.Code = updatedDto.Code.Trim().ToUpper();
                existingLocalization.Symbol = updatedDto.Symbol.Trim();
                existingLocalization.LanguageId = updatedDto.LanguageId;
                existingLocalization.UpdatedAt = now;
            }
            else
            {
                // Mark for deletion if not in the update list
                existingLocalization.IsDeleted = true;
                existingLocalization.DeletedAt = now;
                existingLocalization.UpdatedAt = now;
            }
        }

        // Add new localizations (those with null or 0 Id)
        var newLocalizations = localizationDtos
            .Where(dto => dto.Id == 0)
            .Select(dto => new CurrencyLocalized
            {
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim().ToUpper(),
                Symbol = dto.Symbol.Trim(),
                LanguageId = dto.LanguageId,
                CreatedAt = now,
                UpdatedAt = now,
            });

        foreach (var newLocalization in newLocalizations)
        {
            currency.Localizations.Add(newLocalization);
        }
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.CURRENCY_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateCurrencyDto(CreateCurrencyDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.CURRENCY_NAME_REQUIRED);

        if (createDto.Name.Length > 100)
            return Result.Failure(MessageCodes.CURRENCY_NAME_TOO_LONG);

        // Validate Code
        if (string.IsNullOrWhiteSpace(createDto.Code))
            return Result.Failure(MessageCodes.CURRENCY_CODE_REQUIRED);

        if (createDto.Code.Length > 10)
            return Result.Failure(MessageCodes.CURRENCY_CODE_TOO_LONG);

        // Validate Symbol
        if (string.IsNullOrWhiteSpace(createDto.Symbol))
            return Result.Failure(MessageCodes.CURRENCY_SYMBOL_REQUIRED);

        if (createDto.Symbol.Length > 10)
            return Result.Failure(MessageCodes.CURRENCY_SYMBOL_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateCreateLocalizations(createDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateUpdateCurrencyDto(UpdateCurrencyDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.CURRENCY_NAME_REQUIRED);

        if (updateDto.Name.Length > 100)
            return Result.Failure(MessageCodes.CURRENCY_NAME_TOO_LONG);

        // Validate Code
        if (string.IsNullOrWhiteSpace(updateDto.Code))
            return Result.Failure(MessageCodes.CURRENCY_CODE_REQUIRED);

        if (updateDto.Code.Length > 10)
            return Result.Failure(MessageCodes.CURRENCY_CODE_TOO_LONG);

        // Validate Symbol
        if (string.IsNullOrWhiteSpace(updateDto.Symbol))
            return Result.Failure(MessageCodes.CURRENCY_SYMBOL_REQUIRED);

        if (updateDto.Symbol.Length > 10)
            return Result.Failure(MessageCodes.CURRENCY_SYMBOL_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateUpdateLocalizations(updateDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateCreateLocalizations(List<CreateCurrencyLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_NAME_REQUIRED);

            if (localization.Name.Length > 100)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_NAME_TOO_LONG);

            if (string.IsNullOrWhiteSpace(localization.Code))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_CODE_REQUIRED);

            if (localization.Code.Length > 10)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_CODE_TOO_LONG);

            if (string.IsNullOrWhiteSpace(localization.Symbol))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_SYMBOL_REQUIRED);

            if (localization.Symbol.Length > 10)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_SYMBOL_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    private static Result ValidateUpdateLocalizations(List<UpdateCurrencyLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_NAME_REQUIRED);

            if (localization.Name.Length > 100)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_NAME_TOO_LONG);

            if (string.IsNullOrWhiteSpace(localization.Code))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_CODE_REQUIRED);

            if (localization.Code.Length > 10)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_CODE_TOO_LONG);

            if (string.IsNullOrWhiteSpace(localization.Symbol))
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_SYMBOL_REQUIRED);

            if (localization.Symbol.Length > 10)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_SYMBOL_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.CURRENCY_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static CurrencyDto MapToDto(Currency currency)
    {
        return new CurrencyDto
        {
            Id = currency.Id,
            Name = currency.Name,
            Code = currency.Code,
            Symbol = currency.Symbol,
            IsActive = currency.IsActive,
            CreatedAt = currency.CreatedAt,
            UpdatedAt = currency.UpdatedAt,
            Localizations =
            [
                .. currency.Localizations.Where(l => !l.IsDeleted).Select(MapLocalizationToDto),
            ],
        };
    }

    private static CurrencyLocalizedDto MapLocalizationToDto(CurrencyLocalized localization)
    {
        return new CurrencyLocalizedDto
        {
            Id = localization.Id,
            CurrencyId = localization.CurrencyId,
            Name = localization.Name,
            Code = localization.Code,
            Symbol = localization.Symbol,
            LanguageId = localization.LanguageId,
            CreatedAt = localization.CreatedAt,
            UpdatedAt = localization.UpdatedAt,
            Language =
                localization.Language != null
                    ? new LanguageDto
                    {
                        Id = localization.Language.Id,
                        Code = localization.Language.Code,
                        Name = localization.Language.Name,
                    }
                    : null,
        };
    }

    private static CurrencyDropdownDto MapToDropdownDto(Currency currency)
    {
        return new CurrencyDropdownDto 
        { 
            Id = currency.Id, 
            Name = currency.Name,
            Code = currency.Code,
            Symbol = currency.Symbol
        };
    }

    #endregion
}
