using System.Collections.Generic;

namespace Presentation.Models;

/// <summary>
/// Message DTO for API responses - breaks circular references
/// </summary>
public class MessageDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<MessageLocalizedDto> Localizations { get; set; } = new();
}

/// <summary>
/// MessageLocalized DTO for API responses - breaks circular references
/// </summary>
public class MessageLocalizedDto
{
    public int Id { get; set; }
    public int MessageId { get; set; }
    public int LanguageId { get; set; }
    public string LocalizedText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Include language info without circular reference
    public LanguageDto? Language { get; set; }
}

/// <summary>
/// Language DTO for API responses - minimal info to avoid circular references
/// </summary>
public class LanguageDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Paginated messages response DTO
/// </summary>
public class PaginatedMessagesDto
{
    public List<MessageDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
} 