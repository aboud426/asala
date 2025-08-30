using Asala.Core.Common.Models;
using Asala.Core.Modules.Messages.DTOs;

namespace Asala.UseCases.Messages;

public interface IMessageService
{
    /// <summary>
    /// Gets paginated messages with their localizations
    /// </summary>
    Task<Result<PaginatedResult<MessageDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a message by key with all its localizations
    /// </summary>
    Task<Result<MessageDto?>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Creates a new message with its localizations
    /// </summary>
    Task<Result<MessageDto>> CreateAsync(
        CreateMessageDto createDto,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing message and its localizations
    /// </summary>
    Task<Result<MessageDto?>> UpdateAsync(
        int id,
        UpdateMessageDto updateDto,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Soft deletes a message and all its localizations
    /// </summary>
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Toggles the activation status of a message
    /// </summary>
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
}
