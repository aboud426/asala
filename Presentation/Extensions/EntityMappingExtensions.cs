using Infrastructure.Common;
using Infrastructure.Models;
using Presentation.Models;

namespace Presentation.Extensions;

/// <summary>
/// Extension methods for mapping entities to DTOs
/// </summary>
public static class EntityMappingExtensions
{
    /// <summary>
    /// Maps Message entity to MessageDto, breaking circular references
    /// </summary>
    public static MessageDto ToDto(this Message message)
    {
        if (message == null)
            return new MessageDto();

        return new MessageDto
        {
            Id = message.Id,
            Code = message.Code,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt,
            Localizations = message.MessageLocalizeds?.Select(ml => ml.ToDto()).ToList() ?? new List<MessageLocalizedDto>()
        };
    }

    /// <summary>
    /// Maps MessageLocalized entity to MessageLocalizedDto, breaking circular references
    /// </summary>
    public static MessageLocalizedDto ToDto(this MessageLocalized messageLocalized)
    {
        if (messageLocalized == null)
            return new MessageLocalizedDto();

        return new MessageLocalizedDto
        {
            Id = messageLocalized.Id,
            MessageId = messageLocalized.MessageId,
            LanguageId = messageLocalized.LanguageId,
            LocalizedText = messageLocalized.LocalizedText,
            CreatedAt = messageLocalized.CreatedAt,
            UpdatedAt = messageLocalized.UpdatedAt,
            Language = messageLocalized.Language?.ToDto()
        };
    }

    /// <summary>
    /// Maps Language entity to LanguageDto, minimal info to avoid circular references
    /// </summary>
    public static LanguageDto ToDto(this Language language)
    {
        if (language == null)
            return new LanguageDto();

        return new LanguageDto
        {
            Id = language.Id,
            Code = language.Code,
            Name = language.Name
        };
    }

    /// <summary>
    /// Maps PaginatedResult<Message> to PaginatedMessagesDto
    /// </summary>
    public static PaginatedMessagesDto ToDto(this PaginatedResult<Message> paginatedResult)
    {
        if (paginatedResult == null)
            return new PaginatedMessagesDto();

        return new PaginatedMessagesDto
        {
            Items = paginatedResult.Items.Select(m => m.ToDto()).ToList(),
            TotalCount = paginatedResult.TotalCount,
            Page = paginatedResult.Page,
            PageSize = paginatedResult.PageSize,
            TotalPages = paginatedResult.TotalPages,
            HasNextPage = paginatedResult.HasNextPage,
            HasPreviousPage = paginatedResult.HasPreviousPage
        };
    }
} 