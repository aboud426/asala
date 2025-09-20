using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IProviderMediaRepository : IBaseRepository<ProviderMedia, int>
{
    /// <summary>
    /// Gets all media for a specific provider
    /// </summary>
    /// <param name="providerId">Provider ID</param>
    /// <param name="mediaType">Optional media type filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of provider media</returns>
    Task<Result<IEnumerable<ProviderMedia>>> GetByProviderIdAsync(
        int providerId,
        MediaType? mediaType = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all image URLs for a specific provider
    /// </summary>
    /// <param name="providerId">Provider ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of image URLs</returns>
    Task<Result<IEnumerable<string>>> GetImageUrlsByProviderIdAsync(
        int providerId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets media by URL
    /// </summary>
    /// <param name="url">Media URL</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Provider media if found</returns>
    Task<Result<ProviderMedia?>> GetByUrlAsync(
        string url,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated media for a provider
    /// </summary>
    /// <param name="providerId">Provider ID</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <param name="mediaType">Optional media type filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated result of provider media</returns>
    Task<Result<PaginatedResult<ProviderMedia>>> GetPaginatedByProviderIdAsync(
        int providerId,
        int page,
        int pageSize,
        MediaType? mediaType = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes all media for a specific provider
    /// </summary>
    /// <param name="providerId">Provider ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result indicating success or failure</returns>
    Task<Result<bool>> DeleteByProviderIdAsync(
        int providerId,
        CancellationToken cancellationToken = default
    );
}
