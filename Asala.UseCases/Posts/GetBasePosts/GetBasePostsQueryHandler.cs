using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.GetBasePosts;

public class GetBasePostsQueryHandler
    : IRequestHandler<GetBasePostsQuery, Result<PaginatedResult<BasePostDto>>>
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly AsalaDbContext _context;

    public GetBasePostsQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<BasePostDto>>> Handle(
        GetBasePostsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = ValidateRequest(request);
            if (validationResult.IsFailure)
                return Result.Failure<PaginatedResult<BasePostDto>>(validationResult.MessageCode);

            // Build query
            var query = BuildQuery(request);

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var skip = (request.Page - 1) * request.PageSize;
            var items = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var dtos = new List<BasePostDto>();
            foreach (var item in items)
            {
                var localizations = await _context
                    .BasePostLocalizations.Include(l => l.Language)
                    .Where(l => l.PostId == item.Id)
                    .ToListAsync(cancellationToken);

                var dto = MapToDto(item, localizations);
                dtos.Add(dto);
            }

            // Create paginated result
            var paginatedResult = new PaginatedResult<BasePostDto>(
                items: dtos,
                totalCount: totalCount,
                page: request.Page,
                pageSize: request.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<BasePostDto>>(
                MessageCodes.INTERNAL_SERVER_ERROR,
                ex
            );
        }
    }

    private Result ValidateRequest(GetBasePostsQuery request)
    {
        if (request.Page < MinPage)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE);

        if (request.PageSize < MinPageSize || request.PageSize > MaxPageSize)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        if (request.UserId.HasValue && request.UserId <= 0)
            return Result.Failure(MessageCodes.INVALID_USER_ID);

        if (request.PostTypeId.HasValue && request.PostTypeId <= 0)
            return Result.Failure(MessageCodes.POST_POSTTYPE_ID_INVALID);

        if (request.MinReactions.HasValue && request.MinReactions < 0)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (request.MaxReactions.HasValue && request.MaxReactions < 0)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (
            request.MinReactions.HasValue
            && request.MaxReactions.HasValue
            && request.MinReactions > request.MaxReactions
        )
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (
            request.CreatedAfter.HasValue
            && request.CreatedBefore.HasValue
            && request.CreatedAfter > request.CreatedBefore
        )
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (!string.IsNullOrEmpty(request.SortBy) && !IsValidSortBy(request.SortBy))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (!string.IsNullOrEmpty(request.SortOrder) && !IsValidSortOrder(request.SortOrder))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        return Result.Success();
    }

    private IQueryable<BasePost> BuildQuery(GetBasePostsQuery request)
    {
        var query = _context.BasePosts.Include(bp => bp.PostMedias).AsQueryable();

        // Filter by deleted status
        if (!request.IncludeDeleted)
            query = query.Where(bp => !bp.IsDeleted);

        // Filter by active status
        if (request.IsActive.HasValue)
            query = query.Where(bp => bp.IsActive == request.IsActive.Value);

        // Filter by user ID
        if (request.UserId.HasValue)
            query = query.Where(bp => bp.UserId == request.UserId.Value);

        // Filter by single post type ID
        if (request.PostTypeId.HasValue)
            query = query.Where(bp => bp.PostTypeId == request.PostTypeId.Value);

        // Filter by multiple post type IDs
        if (request.PostTypeIds?.Any() == true)
            query = query.Where(bp => request.PostTypeIds.Contains(bp.PostTypeId));

        // Filter by description
        if (!string.IsNullOrWhiteSpace(request.Description))
            query = query.Where(bp => bp.Description.Contains(request.Description));

        // Filter by creation date range
        if (request.CreatedAfter.HasValue)
            query = query.Where(bp => bp.CreatedAt >= request.CreatedAfter.Value);

        if (request.CreatedBefore.HasValue)
            query = query.Where(bp => bp.CreatedAt <= request.CreatedBefore.Value);

        // Filter by reactions range
        if (request.MinReactions.HasValue)
            query = query.Where(bp => bp.NumberOfReactions >= request.MinReactions.Value);

        if (request.MaxReactions.HasValue)
            query = query.Where(bp => bp.NumberOfReactions <= request.MaxReactions.Value);

        // Apply sorting
        query = ApplySorting(query, request.SortBy, request.SortOrder);

        return query;
    }

    private IQueryable<BasePost> ApplySorting(
        IQueryable<BasePost> query,
        string? sortBy,
        string? sortOrder
    )
    {
        var isDescending = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);

        return sortBy?.ToLower() switch
        {
            "createdat" => isDescending
                ? query.OrderByDescending(bp => bp.CreatedAt)
                : query.OrderBy(bp => bp.CreatedAt),
            "updatedat" => isDescending
                ? query.OrderByDescending(bp => bp.UpdatedAt)
                : query.OrderBy(bp => bp.UpdatedAt),
            "numberofreactions" => isDescending
                ? query.OrderByDescending(bp => bp.NumberOfReactions)
                : query.OrderBy(bp => bp.NumberOfReactions),
            _ => query.OrderByDescending(bp => bp.CreatedAt), // Default sort
        };
    }

    private static bool IsValidSortBy(string sortBy)
    {
        var validSortFields = new[] { "createdAt", "updatedAt", "numberOfReactions" };
        return validSortFields.Contains(sortBy.ToLower());
    }

    private static bool IsValidSortOrder(string sortOrder)
    {
        var validSortOrders = new[] { "asc", "desc" };
        return validSortOrders.Contains(sortOrder.ToLower());
    }

    private static BasePostDto MapToDto(BasePost post, List<BasePostLocalized> localizations)
    {
        return new BasePostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = post.Description,
            NumberOfReactions = post.NumberOfReactions,
            PostTypeId = post.PostTypeId,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PostMedias = post
                .PostMedias.Select(m => new BasePostMediaDto
                {
                    Id = m.Id,
                    Url = m.Url,
                    MediaType = m.MediaType,
                    DisplayOrder = m.DisplayOrder,
                })
                .ToList(),
            Localizations = localizations
                .Select(l => new BasePostLocalizedDto
                {
                    Id = l.Id,
                    LanguageId = l.LanguageId,
                    Description = l.Description,
                    LanguageName = l.Language.Name,
                    LanguageCode = l.Language.Code,
                })
                .ToList(),
        };
    }
}
