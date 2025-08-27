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
    Task<Result<string?>> GetLocalizedMessageAsync(string code, int languageId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Message>>> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken = default);
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
        // Validation
        if (messageId <= 0)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_ID);

        if (languageId <= 0)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        if (string.IsNullOrWhiteSpace(text))
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_TEXT_REQUIRED);

        // Validate message exists
        var messageResult = await GetMessageByIdAsync(messageId, cancellationToken);
        if (messageResult.IsFailure)
            return Result.Failure<MessageLocalized>(messageResult.Error!);

        if (messageResult.Value == null)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_NOT_FOUND);

        // Validate language exists
        var languageRepository = _unitOfWork.Repository<Language>();
        var languageExistsResult = await languageRepository.AnyAsync(l => l.Id == languageId, cancellationToken);
        if (languageExistsResult.IsFailure)
            return Result.Failure<MessageLocalized>(languageExistsResult.Error!);

        if (!languageExistsResult.Value)
            return Result.Failure<MessageLocalized>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        // Check if localization already exists
        var messageLocalizedRepository = _unitOfWork.Repository<MessageLocalized>();
        var existingLocalizationResult = await messageLocalizedRepository.AnyAsync(
            ml => ml.MessageId == messageId && ml.LanguageId == languageId, 
            cancellationToken);

        if (existingLocalizationResult.IsFailure)
            return Result.Failure<MessageLocalized>(existingLocalizationResult.Error!);

        MessageLocalized messageLocalized;

        if (existingLocalizationResult.Value)
        {
            // Update existing localization
            var existingResult = await messageLocalizedRepository.GetAsync(
                filter: ml => ml.MessageId == messageId && ml.LanguageId == languageId,
                cancellationToken: cancellationToken);

            if (existingResult.IsFailure)
                return Result.Failure<MessageLocalized>(existingResult.Error!);

            messageLocalized = existingResult.Value!.First();
            messageLocalized.LocalizedText = text.Trim();
            messageLocalized.UpdatedAt = DateTime.UtcNow;

            var updateResult = messageLocalizedRepository.Update(messageLocalized);
            if (updateResult.IsFailure)
                return Result.Failure<MessageLocalized>(updateResult.Error!);
        }
        else
        {
            // Create new localization
            messageLocalized = new MessageLocalized
            {
                MessageId = messageId,
                LanguageId = languageId,
                LocalizedText = text.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var addResult = await messageLocalizedRepository.AddAsync(messageLocalized, cancellationToken);
            if (addResult.IsFailure)
                return Result.Failure<MessageLocalized>(addResult.Error!);

            messageLocalized = addResult.Value!;
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<MessageLocalized>(saveResult.Error!);

        // Cache invalidation
        InvalidateMessageCaches(messageResult.Value.Code, messageId, languageId);

        return Result<MessageLocalized>.Success(messageLocalized);
    }

    public async Task<Result<string?>> GetLocalizedMessageAsync(string code, int languageId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure<string?>(ErrorCodes.MESSAGE_CODE_REQUIRED);

        if (languageId <= 0)
            return Result.Failure<string?>(ErrorCodes.MESSAGE_INVALID_LANGUAGE);

        // Get message by code first
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

    public async Task<Result<PaginatedResult<Message>>> GetMessagesAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"messages_page_{page}_size_{pageSize}";

        return await _cache.GetOrSetAsync(
            cacheKey,
            async () => await _unitOfWork.Repository<Message>().GetPaginatedAsync(
                page,
                pageSize,
                orderBy: query => query.OrderBy(m => m.Code),
                includeProperties: "MessageLocalizeds",
                cancellationToken: cancellationToken),
            CacheHelper.ExpirationTimes.Short // Shorter expiration for paginated lists
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