using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using Asala.UseCases.Posts.CreateReel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.GetReels;

public class GetReelsQueryHandler : IRequestHandler<GetReelsQuery, Result<PaginatedResult<ReelDto>>>
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly AsalaDbContext _context;

    public GetReelsQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<ReelDto>>> Handle(
        GetReelsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = ValidateRequest(request);
            if (validationResult.IsFailure)
                return Result.Failure<PaginatedResult<ReelDto>>(validationResult.MessageCode);

            // Build query for BasePosts that have Reel entries
            var query = BuildQuery(request);

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var skip = (request.Page - 1) * request.PageSize;
            var basePosts = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to ReelDto objects
            var reelDtos = new List<ReelDto>();
            foreach (var basePost in basePosts)
            {
                var localizations = await _context
                    .BasePostLocalizations.Include(l => l.Language)
                    .Where(l => l.PostId == basePost.Id && !l.IsDeleted)
                    .ToListAsync(cancellationToken);

                var reelDto = MapToReelDto(basePost, localizations);
                reelDtos.Add(reelDto);
            }

            // Create paginated result
            var result = PaginatedResult<ReelDto>.Create(
                reelDtos,
                totalCount,
                request.Page,
                request.PageSize
            );

            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<ReelDto>>(MessageCodes.INTERNAL_SERVER_ERROR);
        }
    }

    private Result ValidateRequest(GetReelsQuery request)
    {
        if (request.Page < MinPage)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (request.PageSize < MinPageSize || request.PageSize > MaxPageSize)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (!string.IsNullOrEmpty(request.SortBy) && !IsValidSortBy(request.SortBy))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (!string.IsNullOrEmpty(request.SortOrder) && !IsValidSortOrder(request.SortOrder))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        return Result.Success();
    }

    private IQueryable<BasePost> BuildQuery(GetReelsQuery request)
    {
        var query = _context
            .BasePosts.Include(bp => bp.PostMedias)
            .Include(bp => bp.Reel) // Include Reel navigation property
            .Where(bp => bp.Reel != null) // Only include BasePosts that have a Reel
            .AsQueryable();

        // Filter by deleted status
        if (!request.IncludeDeleted)
            query = query.Where(bp => !bp.IsDeleted);

        // Filter by active status
        if (request.IsActive.HasValue)
            query = query.Where(bp => bp.IsActive == request.IsActive.Value);

        // Filter by user ID
        if (request.UserId.HasValue)
            query = query.Where(bp => bp.UserId == request.UserId.Value);

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
        var isAscending = string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);

        return sortBy?.ToLower() switch
        {
            "updatedat" => isAscending
                ? query.OrderBy(bp => bp.UpdatedAt)
                : query.OrderByDescending(bp => bp.UpdatedAt),
            "numberofreactions" => isAscending
                ? query.OrderBy(bp => bp.NumberOfReactions)
                : query.OrderByDescending(bp => bp.NumberOfReactions),
            _ => isAscending
                ? query.OrderBy(bp => bp.CreatedAt)
                : query.OrderByDescending(bp => bp.CreatedAt),
        };
    }

    private static bool IsValidSortBy(string sortBy)
    {
        var validSortFields = new[] { "createdat", "updatedat", "numberofreactions" };
        return validSortFields.Contains(sortBy.ToLower());
    }

    private static bool IsValidSortOrder(string sortOrder)
    {
        var validSortOrders = new[] { "asc", "desc" };
        return validSortOrders.Contains(sortOrder.ToLower());
    }

    private static ReelDto MapToReelDto(BasePost basePost, List<BasePostLocalized> localizations)
    {
        var basePostDto = new BasePostDto
        {
            Id = basePost.Id,
            UserId = basePost.UserId,
            Description = basePost.Description,
            NumberOfReactions = basePost.NumberOfReactions,
            NumberOfComments = basePost.NumberOfComments,
            PostTypeId = basePost.PostTypeId,
            IsActive = basePost.IsActive,
            CreatedAt = basePost.CreatedAt,
            UpdatedAt = basePost.UpdatedAt,
            PostMedias = basePost
                .PostMedias.Where(pm => !pm.IsDeleted)
                .OrderBy(pm => pm.DisplayOrder)
                .Select(pm => new BasePostMediaDto
                {
                    Id = pm.Id,
                    Url = pm.Url,
                    MediaType = pm.MediaType,
                    DisplayOrder = pm.DisplayOrder,
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

        return new ReelDto { PostId = basePost.Id, BasePost = basePostDto };
    }
}
