using System.Reflection;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Messages.DTOs;
using Microsoft.Extensions.Logging;

namespace Asala.UseCases.Messages;

/// <summary>
/// Service for seeding message codes from MessageCodes class into the database on startup
/// </summary>
public class MessageCodesSeederService
{
    private readonly IMessageService _messageService;
    private readonly ILogger<MessageCodesSeederService> _logger;

    public MessageCodesSeederService(
        IMessageService messageService,
        ILogger<MessageCodesSeederService> logger
    )
    {
        _messageService = messageService;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all message codes from MessageCodes class into the database
    /// </summary>
    public async Task<Result> SeedMessageCodesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting MessageCodes seeding process...");

            // Get all constants from MessageCodes class using reflection
            var messageCodeFields = typeof(MessageCodes)
                .GetFields(
                    BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy
                )
                .Where(fi => fi.IsLiteral && !fi.IsInitOnly && fi.FieldType == typeof(string))
                .ToList();

            _logger.LogInformation(
                "Found {Count} message codes to process",
                messageCodeFields.Count
            );

            int seededCount = 0;
            int skippedCount = 0;

            foreach (var field in messageCodeFields)
            {
                var messageKey = field.GetValue(null)?.ToString();
                if (string.IsNullOrEmpty(messageKey))
                {
                    _logger.LogWarning(
                        "Skipping null or empty message key for field: {FieldName}",
                        field.Name
                    );
                    continue;
                }

                // Check if message already exists
                var existingMessageResult = await _messageService.GetByKeyAsync(
                    messageKey,
                    cancellationToken
                );
                if (existingMessageResult.IsFailure)
                {
                    _logger.LogError(
                        "Error checking existing message for key {MessageKey}: {Error}",
                        messageKey,
                        existingMessageResult.MessageCode
                    );
                    continue;
                }

                if (existingMessageResult.Value != null)
                {
                    _logger.LogDebug("Message {MessageKey} already exists, skipping", messageKey);
                    skippedCount++;
                    continue;
                }

                // Get default text for this message code
                var defaultText = GenerateDefaultText(messageKey);

                // Create new message
                var createDto = new CreateMessageDto
                {
                    Key = messageKey,
                    DefaultText = defaultText,
                    Localizations = new List<CreateMessageLocalizedDto>(),
                };

                var createResult = await _messageService.CreateAsync(createDto, cancellationToken);
                if (createResult.IsSuccess)
                {
                    _logger.LogDebug("Successfully seeded message: {MessageKey}", messageKey);
                    seededCount++;
                }
                else
                {
                    _logger.LogError(
                        "Failed to create message {MessageKey}: {Error}",
                        messageKey,
                        createResult.MessageCode
                    );
                }
            }

            _logger.LogInformation(
                "MessageCodes seeding completed. Seeded: {SeededCount}, Skipped: {SkippedCount}",
                seededCount,
                skippedCount
            );

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during MessageCodes seeding process");
            return Result.Failure(MessageCodes.EXECUTION_ERROR);
        }
    }

    /// <summary>
    /// Generates a default text for a message code if not predefined
    /// </summary>
    private static string GenerateDefaultText(string messageCode)
    {
        // Convert SNAKE_CASE to readable text
        var words = messageCode
            .Split('_')
            .Select(word => char.ToUpperInvariant(word[0]) + word[1..].ToLowerInvariant());

        return string.Join(" ", words);
    }
}
