using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Business.Common;

namespace Business.Services;

/// <summary>
/// Message service for managing localized messages
/// </summary>
public interface IMessageService
{
    Task<Result<Message?>> GetMessageByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<Message?>> GetMessageByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<Result<Message>> CreateMessageAsync(string code, CancellationToken cancellationToken = default);
    Task<Result<MessageLocalized>> AddLocalizedMessageAsync(int messageId, int languageId, string text, CancellationToken cancellationToken = default);
    Task<Result<MessageLocalized>> AddLocalizedMessageByLanguageCodeAsync(int messageId, string languageCode, string text, CancellationToken cancellationToken = default);
    Task<Result<string?>> GetLocalizedMessageAsync(string code, int languageId, CancellationToken cancellationToken = default);
    Task<Result<string?>> GetLocalizedMessageByLanguageCodeAsync(string code, string languageCode, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Message>>> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Message>>> GetMessagesWithLocalizationsAsync(int page, int pageSize, string languageCode, CancellationToken cancellationToken = default);
}

public class MessageService : IMessageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;

    public MessageService(IUnitOfWork unitOfWork, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<Result<Message?>> GetMessageByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<Message?>(ErrorCodes.MESSAGE_INVALID_ID);

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.Message(id),
            async () => await _unitOfWork.Repository<Message>().GetByIdAsync(id, cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<Message?>> GetMessageByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Message?>(ErrorCodes.MESSAGE_CODE_REQUIRED);

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.MessageByCode(code),
            async () => 
            {
                var repository = _unitOfWork.Repository<Message>();
                var messages = await repository.GetAsync(
                    filter: m => m.Code == code.Trim(), 
                    cancellationToken: cancellationToken);
                
                if (messages.IsFailure)
                    return Result.Failure<Message?>(messages.Error!);

                return Result<Message?>.Success(messages.Value?.FirstOrDefault());
            },
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<Message>> CreateMessageAsync(string code, CancellationToken cancellationToken = default)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<Message>(ErrorCodes.MESSAGE_CODE_REQUIRED);

        code = code.Trim().ToUpper();

        // Check if message with this code already exists
        var existingMessageResult = await GetMessageByCodeAsync(code, cancellationToken);
        if (existingMessageResult.IsFailure)
            return Result.Failure<Message>(existingMessageResult.Error!);

        if (existingMessageResult.Value != null)
            return Result.Failure<Message>(ErrorCodes.MESSAGE_CODE_EXISTS);

        // Create message
        var message = new Message
        {
            Code = code,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var repository = _unitOfWork.Repository<Message>();
        var addResult = await repository.AddAsync(message, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<Message>(addResult.Error!);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<Message>(saveResult.Error!);

        // Cache invalidation: Clear related cache entries
        InvalidateMessageCaches(code);

        return Result<Message>.Success(addResult.Value!);
    }

    public async Task<Result<MessageLocalized>> AddLocalizedMessageAsync(int messageId, int languageId, string text, CancellationToken cancellationToken = default)
    {
        if (messageId <= 0)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_ID);

        if (languageId <= 0)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_TEXT_REQUIRED);

        // Check if message exists
        var messageResult = await GetMessageByIdAsync(messageId, cancellationToken);
        if (messageResult.IsFailure)
            return Result.Failure<MessageLocalized>(messageResult.Error!);

        if (messageResult.Value == null)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_NOT_FOUND);

        // Check if language exists
        var languageResult = await _unitOfWork.Repository<Language>().GetByIdAsync(languageId, cancellationToken);
        if (languageResult.IsFailure)
            return Result.Failure<MessageLocalized>(languageResult.Error!);

        if (languageResult.Value == null)
            return Result.Failure<MessageLocalized>(ErrorCodes.LANGUAGE_NOT_FOUND);

        // Check if localization already exists
        var existingLocalizationResult = await _unitOfWork.Repository<MessageLocalized>().GetAsync(
            filter: ml => ml.MessageId == messageId && ml.LanguageId == languageId,
            cancellationToken: cancellationToken);

        if (existingLocalizationResult.IsFailure)
            return Result.Failure<MessageLocalized>(existingLocalizationResult.Error!);

        MessageLocalized messageLocalized;
        if (existingLocalizationResult.Value != null && existingLocalizationResult.Value.Any())
        {
            // Update existing localization
            messageLocalized = existingLocalizationResult.Value.First();
            messageLocalized.LocalizedText = text;
            messageLocalized.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<MessageLocalized>().Update(messageLocalized);
        }
        else
        {
            // Create new localization
            messageLocalized = new MessageLocalized
            {
                MessageId = messageId,
                LanguageId = languageId,
                LocalizedText = text,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var addResult = await _unitOfWork.Repository<MessageLocalized>().AddAsync(messageLocalized, cancellationToken);
            if (addResult.IsFailure)
                return Result.Failure<MessageLocalized>(addResult.Error!);
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<MessageLocalized>(saveResult.Error!);

        // Invalidate related caches
        InvalidateMessageCaches(messageId: messageId, languageId: languageId);

        return Result<MessageLocalized>.Success(messageLocalized);
    }

    /// <summary>
    /// Add or update localized message using language code
    /// </summary>
    public async Task<Result<MessageLocalized>> AddLocalizedMessageByLanguageCodeAsync(int messageId, string languageCode, string text, CancellationToken cancellationToken = default)
    {
        if (messageId <= 0)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_ID);

        if (string.IsNullOrWhiteSpace(languageCode))
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_TEXT_REQUIRED);

        // Get the language ID for the given code
        var languageResult = await _unitOfWork.Repository<Language>().GetAsync(
            filter: l => l.Code == languageCode.Trim().ToUpper(),
            cancellationToken: cancellationToken);

        if (languageResult.IsFailure || languageResult.Value == null || !languageResult.Value.Any())
            return Result.Failure<MessageLocalized>(ErrorCodes.LANGUAGE_NOT_FOUND);

        var languageId = languageResult.Value.First().Id;

        // Use the existing method with the resolved language ID
        return await AddLocalizedMessageAsync(messageId, languageId, text, cancellationToken);
    }

    public async Task<Result<string?>> GetLocalizedMessageAsync(string code, int languageId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<string?>(ErrorCodes.MESSAGE_CODE_REQUIRED);

        if (languageId <= 0)
            return Result.Failure<string?>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        // Cache-aside pattern for message lookup
        var messageResult = await GetMessageByCodeAsync(code, cancellationToken);
        if (messageResult.IsFailure)
            return Result.Failure<string?>(messageResult.Error!);

        if (messageResult.Value == null)
            return Result.Failure<string?>(ErrorCodes.MESSAGE_NOT_FOUND);

        var messageId = messageResult.Value.Id;

        // Cache-aside pattern for localized text
        return await _cache.GetOrSetAsync(
            CacheKeys.MessageLocalized(messageId, languageId),
            async () =>
            {
                var repository = _unitOfWork.Repository<MessageLocalized>();
                var localizedMessages = await repository.GetAsync(
                    filter: ml => ml.MessageId == messageId && ml.LanguageId == languageId,
                    cancellationToken: cancellationToken);

                if (localizedMessages.IsFailure)
                    return Result.Failure<string?>(localizedMessages.Error!);

                var localizedMessage = localizedMessages.Value?.FirstOrDefault();
                return Result<string?>.Success(localizedMessage?.LocalizedText);
            },
            CacheHelper.ExpirationTimes.Long // Localized messages change less frequently
        );
    }

    /// <summary>
    /// Get localized message by code and language code
    /// </summary>
    public async Task<Result<string?>> GetLocalizedMessageByLanguageCodeAsync(string code, string languageCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<string?>(ErrorCodes.MESSAGE_CODE_REQUIRED);

        if (string.IsNullOrWhiteSpace(languageCode))
            return Result.Failure<string?>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        // Get the language ID for the given code
        var languageResult = await _unitOfWork.Repository<Language>().GetAsync(
            filter: l => l.Code == languageCode.Trim().ToUpper(),
            cancellationToken: cancellationToken);

        if (languageResult.IsFailure || languageResult.Value == null || !languageResult.Value.Any())
            return Result.Failure<string?>(ErrorCodes.LANGUAGE_NOT_FOUND);

        var languageId = languageResult.Value.First().Id;

        // Use the existing method with the resolved language ID
        return await GetLocalizedMessageAsync(code, languageId, cancellationToken);
    }

    public async Task<Result<PaginatedResult<Message>>> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"messages_page_{page}_size_{pageSize}";

        return await _cache.GetOrSetAsync(
            cacheKey,
            async () => await _unitOfWork.Repository<Message>().GetPaginatedAsync(
                page,
                pageSize,
                orderBy: query => query.OrderBy(m => m.Code),
                includeProperties: "", // Remove MessageLocalizeds to avoid circular reference
                cancellationToken: cancellationToken),
            CacheHelper.ExpirationTimes.Short // Shorter expiration for paginated lists
        );
    }

    /// <summary>
    /// Get messages with localizations for a specific language
    /// </summary>
    public async Task<Result<PaginatedResult<Message>>> GetMessagesWithLocalizationsAsync(int page, int pageSize, string languageCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return Result.Failure<PaginatedResult<Message>>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        var cacheKey = $"messages_with_localizations_page_{page}_size_{pageSize}_lang_{languageCode}";

        return await _cache.GetOrSetAsync(
            cacheKey,
            async () => 
            {
                // Get messages without navigation properties first
                var messagesResult = await _unitOfWork.Repository<Message>().GetPaginatedAsync(
                    page,
                    pageSize,
                    orderBy: query => query.OrderBy(m => m.Code),
                    includeProperties: "",
                    cancellationToken: cancellationToken);

                if (messagesResult.IsFailure)
                    return messagesResult;

                // Get the language ID for the given code
                var languageResult = await _unitOfWork.Repository<Language>().GetAsync(
                    filter: l => l.Code == languageCode.Trim().ToUpper(),
                    cancellationToken: cancellationToken);

                if (languageResult.IsFailure || languageResult.Value == null || !languageResult.Value.Any())
                    return Result.Failure<PaginatedResult<Message>>(ErrorCodes.LANGUAGE_NOT_FOUND);

                var languageId = languageResult.Value.First().Id;

                // Then get localizations for each message
                var messages = messagesResult.Value!.Items;
                foreach (var message in messages)
                {
                    var localizationsResult = await _unitOfWork.Repository<MessageLocalized>().GetAsync(
                        filter: ml => ml.MessageId == message.Id && ml.LanguageId == languageId,
                        cancellationToken: cancellationToken);

                    if (localizationsResult.IsSuccess && localizationsResult.Value != null)
                    {
                        message.MessageLocalizeds = localizationsResult.Value.ToList();
                    }
                }

                return messagesResult;
            },
            CacheHelper.ExpirationTimes.Short
        );
    }

    /// <summary>
    /// Invalidates message-related cache entries
    /// </summary>
    private void InvalidateMessageCaches(string? code = null, int? messageId = null, int? languageId = null)
    {
        // Remove general messages cache
        _cache.Remove(CacheKeys.ALL_MESSAGES);

        // Remove specific message caches
        if (!string.IsNullOrWhiteSpace(code))
        {
            _cache.Remove(CacheKeys.MessageByCode(code));
        }

        if (messageId.HasValue)
        {
            _cache.Remove(CacheKeys.Message(messageId.Value));

            // Remove localized message caches for this message
            if (languageId.HasValue)
            {
                _cache.Remove(CacheKeys.MessageLocalized(messageId.Value, languageId.Value));
            }
        }

        // Remove paginated message lists
        _cache.RemoveByPattern("messages_page_");
    }
}