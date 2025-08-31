using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Messages.Db;
using Asala.Core.Modules.Messages.DTOs;
using Asala.Core.Modules.Messages.Models;

namespace Asala.UseCases.Messages;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MessageService(IMessageRepository messageRepository, IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<MessageDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _messageRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<MessageDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<MessageDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<MessageDto?>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(key))
            return Result.Failure<MessageDto?>(MessageCodes.MESSAGE_KEY_REQUIRED);

        var result = await _messageRepository.GetByKeyWithLocalizationsAsync(
            key,
            cancellationToken
        );
        if (result.IsFailure)
            return Result.Failure<MessageDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<MessageDto>> CreateAsync(
        CreateMessageDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateMessageDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<MessageDto>(validationResult.MessageCode);

        // Check if message key already exists
        var existsResult = await _messageRepository.ExistsByKeyAsync(
            createDto.Key,
            cancellationToken: cancellationToken
        );
        if (existsResult.IsFailure)
            return Result.Failure<MessageDto>(existsResult.MessageCode);

        if (existsResult.Value)
            return Result.Failure<MessageDto>(MessageCodes.MESSAGE_KEY_ALREADY_EXISTS);

        var message = new Message
        {
            Key = createDto.Key.Trim(),
            DefaultText = createDto.DefaultText.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Localizations = CreateLocalizations(createDto.Localizations, createDto.Key.Trim()),
        };

        var addResult = await _messageRepository.AddAsync(message, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<MessageDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<MessageDto>(saveResult.MessageCode);

        // Get the created message with its localizations
        var createdMessageResult = await _messageRepository.GetByIdWithLocalizationsAsync(
            addResult.Value.Id,
            cancellationToken
        );

        if (createdMessageResult.IsFailure || createdMessageResult.Value == null)
            return Result.Failure<MessageDto>(MessageCodes.MESSAGE_NOT_FOUND);

        var dto = MapToDto(createdMessageResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<MessageDto?>> UpdateAsync(
        int id,
        UpdateMessageDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<MessageDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateMessageDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<MessageDto?>(validationResult.MessageCode);

        // Get existing message
        var getResult = await _messageRepository.GetByIdWithLocalizationsAsync(
            id,
            cancellationToken
        );
        if (getResult.IsFailure)
            return Result.Failure<MessageDto?>(getResult.MessageCode);

        var message = getResult.Value;
        if (message == null)
            return Result.Success<MessageDto?>(null);

        // Check if key is being changed and if new key already exists
        if (message.Key != updateDto.Key.Trim())
        {
            var existsResult = await _messageRepository.ExistsByKeyAsync(
                updateDto.Key.Trim(),
                excludeId: id,
                cancellationToken
            );

            if (existsResult.IsFailure)
                return Result.Failure<MessageDto?>(existsResult.MessageCode);

            if (existsResult.Value)
                return Result.Failure<MessageDto?>(MessageCodes.MESSAGE_KEY_ALREADY_EXISTS);
        }

        // Update message properties
        message.Key = updateDto.Key.Trim();
        message.DefaultText = updateDto.DefaultText.Trim();
        message.IsActive = updateDto.IsActive;
        message.UpdatedAt = DateTime.UtcNow;

        // Handle localizations
        await UpdateLocalizations(message, updateDto.Localizations, updateDto.Key.Trim());

        var updateResult = _messageRepository.Update(message);
        if (updateResult.IsFailure)
            return Result.Failure<MessageDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<MessageDto?>(saveResult.MessageCode);

        var dto = MapToDto(message);
        return Result.Success<MessageDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _messageRepository.GetByIdWithLocalizationsAsync(
            id,
            cancellationToken
        );
        if (getResult.IsFailure)
            return getResult;

        var message = getResult.Value;
        if (message == null)
            return Result.Failure(MessageCodes.MESSAGE_NOT_FOUND);

        // Soft delete message and all localizations
        message.IsDeleted = true;
        message.DeletedAt = DateTime.UtcNow;
        message.UpdatedAt = DateTime.UtcNow;

        foreach (var localization in message.Localizations)
        {
            localization.IsDeleted = true;
            localization.DeletedAt = DateTime.UtcNow;
            localization.UpdatedAt = DateTime.UtcNow;
        }

        var updateResult = _messageRepository.Update(message);
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

        var getResult = await _messageRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var message = getResult.Value;
        if (message == null)
            return Result.Failure(MessageCodes.MESSAGE_NOT_FOUND);

        message.IsActive = !message.IsActive;
        message.UpdatedAt = DateTime.UtcNow;

        var updateResult = _messageRepository.Update(message);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<MessageDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<MessageDto?>(idValidationResult.MessageCode);

        var messageResult = await _messageRepository.GetByIdWithLocalizationsAsync(id, cancellationToken);
        if (messageResult.IsFailure)
            return Result.Failure<MessageDto?>(messageResult.MessageCode);

        if (messageResult.Value == null || messageResult.Value.IsDeleted)
            return Result.Failure<MessageDto?>(MessageCodes.MESSAGE_NOT_FOUND);

        var messageDto = MapToDto(messageResult.Value);
        return Result.Success<MessageDto?>(messageDto);
    }

    public async Task<Result<IEnumerable<int>>> GetMessagesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        // Delegate to the optimized repository method that uses efficient SQL joins
        return await _messageRepository.GetMessagesMissingTranslationsAsync(cancellationToken);
    }

    #region Private Helper Methods

    private static List<MessageLocalized> CreateLocalizations(
        List<CreateMessageLocalizedDto> localizationDtos,
        string messageKey
    )
    {
        return localizationDtos
            .Select(dto => new MessageLocalized
            {
                Key = messageKey,
                Text = dto.Text.Trim(),
                LanguageId = dto.LanguageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();
    }

    private static async Task UpdateLocalizations(
        Message message,
        List<UpdateMessageLocalizedDto> localizationDtos,
        string messageKey
    )
    {
        var now = DateTime.UtcNow;

        // Handle existing localizations
        foreach (var existingLocalization in message.Localizations)
        {
            var updatedDto = localizationDtos.FirstOrDefault(dto =>
                dto.Id == existingLocalization.Id
            );
            if (updatedDto != null)
            {
                // Update existing localization
                existingLocalization.Key = messageKey;
                existingLocalization.Text = updatedDto.Text.Trim();
                existingLocalization.LanguageId = updatedDto.LanguageId;
                existingLocalization.IsActive = updatedDto.IsActive;
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
            .Where(dto => !dto.Id.HasValue || dto.Id.Value == 0)
            .Select(dto => new MessageLocalized
            {
                Key = messageKey,
                Text = dto.Text.Trim(),
                LanguageId = dto.LanguageId,
                IsActive = dto.IsActive,
                CreatedAt = now,
                UpdatedAt = now,
            });

        foreach (var newLocalization in newLocalizations)
        {
            message.Localizations.Add(newLocalization);
        }
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.MESSAGE_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateMessageDto(CreateMessageDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Key
        if (string.IsNullOrWhiteSpace(createDto.Key))
            return Result.Failure(MessageCodes.MESSAGE_KEY_REQUIRED);

        if (createDto.Key.Length > 200)
            return Result.Failure(MessageCodes.MESSAGE_KEY_TOO_LONG);

        // Validate DefaultText
        if (string.IsNullOrWhiteSpace(createDto.DefaultText))
            return Result.Failure(MessageCodes.MESSAGE_DEFAULT_TEXT_REQUIRED);

        if (createDto.DefaultText.Length > 2000)
            return Result.Failure(MessageCodes.MESSAGE_DEFAULT_TEXT_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateLocalizations(createDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateUpdateMessageDto(UpdateMessageDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Same validations as Create
        if (string.IsNullOrWhiteSpace(updateDto.Key))
            return Result.Failure(MessageCodes.MESSAGE_KEY_REQUIRED);

        if (updateDto.Key.Length > 200)
            return Result.Failure(MessageCodes.MESSAGE_KEY_TOO_LONG);

        if (string.IsNullOrWhiteSpace(updateDto.DefaultText))
            return Result.Failure(MessageCodes.MESSAGE_DEFAULT_TEXT_REQUIRED);

        if (updateDto.DefaultText.Length > 2000)
            return Result.Failure(MessageCodes.MESSAGE_DEFAULT_TEXT_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateUpdateLocalizations(updateDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateLocalizations(List<CreateMessageLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Key))
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_KEY_REQUIRED);

            if (string.IsNullOrWhiteSpace(localization.Text))
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_TEXT_REQUIRED);

            if (localization.Text.Length > 2000)
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_TEXT_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    private static Result ValidateUpdateLocalizations(List<UpdateMessageLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Key))
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_KEY_REQUIRED);

            if (string.IsNullOrWhiteSpace(localization.Text))
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_TEXT_REQUIRED);

            if (localization.Text.Length > 2000)
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_TEXT_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static MessageDto MapToDto(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            Key = message.Key,
            DefaultText = message.DefaultText,
            IsActive = message.IsActive,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt,
            Localizations = message
                .Localizations.Where(l => !l.IsDeleted)
                .Select(MapLocalizationToDto)
                .ToList(),
        };
    }

    private static MessageLocalizedDto MapLocalizationToDto(MessageLocalized localization)
    {
        return new MessageLocalizedDto
        {
            Id = localization.Id,
            Key = localization.Key,
            Text = localization.Text,
            LanguageId = localization.LanguageId,
            LanguageName = localization.Language?.Name ?? string.Empty,
            LanguageCode = localization.Language?.Code ?? string.Empty,
            IsActive = localization.IsActive,
            CreatedAt = localization.CreatedAt,
            UpdatedAt = localization.UpdatedAt,
        };
    }

    #endregion
}
