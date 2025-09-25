using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Comments;

public class GetCommentsQueryHandler : IRequestHandler<GetCommentsQuery, Result<List<CommentDto>>>
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly AsalaDbContext _context;

    public GetCommentsQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CommentDto>>> Handle(
        GetCommentsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = ValidateRequest(request);
            if (validationResult.IsFailure)
                return Result.Failure<List<CommentDto>>(validationResult.MessageCode);

            // Verify BasePost exists
            var basePostExists = await _context.BasePosts
                .AnyAsync(bp => bp.Id == request.BasePostId && bp.IsActive && !bp.IsDeleted, cancellationToken);
            
            if (!basePostExists)
                return Result.Failure<List<CommentDto>>(MessageCodes.NOT_FOUND);

            // Build query
            var query = BuildQuery(request);

            // Apply pagination
            var skip = (request.Page - 1) * request.PageSize;
            var comments = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var commentDtos = comments.Select(comment => new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                UserName = comment.User.Name,
                BasePostId = comment.BasePostId,
                Content = comment.Content,
                ParentId = comment.ParentId,
                IsActive = comment.IsActive,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            }).ToList();

            return Result.Success(commentDtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<CommentDto>>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private Result ValidateRequest(GetCommentsQuery request)
    {
        // Validate pagination
        if (request.Page < MinPage)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (request.PageSize < MinPageSize || request.PageSize > MaxPageSize)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        // Validate sort order
        if (!string.IsNullOrEmpty(request.SortOrder) && 
            !request.SortOrder.Equals("asc", StringComparison.OrdinalIgnoreCase) &&
            !request.SortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase))
        {
            return Result.Failure(MessageCodes.INVALID_INPUT);
        }

        return Result.Success();
    }

    private IQueryable<Core.Modules.Posts.Models.Comment> BuildQuery(GetCommentsQuery request)
    {
        var query = _context.Comments
            .Include(c => c.User)
            .Where(c => c.BasePostId == request.BasePostId && c.IsActive && !c.IsDeleted);

        // Filter by ParentId
        if (request.ParentId.HasValue)
        {
            query = query.Where(c => c.ParentId == request.ParentId.Value);
        }
        else
        {
            // If ParentId is null, get top-level comments (ParentId is null)
            query = query.Where(c => c.ParentId == null);
        }

        // Apply sorting
        if (request.SortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase))
        {
            query = query.OrderByDescending(c => c.CreatedAt);
        }
        else
        {
            query = query.OrderBy(c => c.CreatedAt);
        }

        return query;
    }
}
