using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Comments;

public class GetSubCommentsQueryHandler : IRequestHandler<GetSubCommentsQuery, Result<SubCommentsResponseDto>>
{
    private readonly AsalaDbContext _context;

    public GetSubCommentsQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SubCommentsResponseDto>> Handle(
        GetSubCommentsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate parent comment exists
            var parentComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId && 
                                        c.IsActive && !c.IsDeleted, cancellationToken);

            if (parentComment == null)
            {
                return Result.Failure<SubCommentsResponseDto>(MessageCodes.NOT_FOUND);
            }

            // Get total count of replies
            var totalReplies = await _context.Comments
                .CountAsync(c => c.ParentId == request.ParentCommentId && 
                               c.IsActive && !c.IsDeleted, cancellationToken);

            // Calculate pagination
            var totalPages = (int)Math.Ceiling((double)totalReplies / request.PageSize);
            var skip = (request.Page - 1) * request.PageSize;

            // Get replies with pagination
            var repliesQuery = _context.Comments
                .Include(c => c.User)
                .Where(c => c.ParentId == request.ParentCommentId && 
                          c.IsActive && !c.IsDeleted);

            // Apply sorting
            if (request.SortOrder.ToLower() == "desc")
            {
                repliesQuery = repliesQuery.OrderByDescending(c => c.CreatedAt);
            }
            else
            {
                repliesQuery = repliesQuery.OrderBy(c => c.CreatedAt);
            }

            var replies = await repliesQuery
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var replyDtos = replies.Select(reply => new CommentDto
            {
                Id = reply.Id,
                UserId = reply.UserId,
                UserName = reply.User.Name,
                BasePostId = reply.BasePostId,
                Content = reply.Content,
                ParentId = reply.ParentId,
                NumberOfReplies = reply.NumberOfReplies,
                IsActive = reply.IsActive,
                CreatedAt = reply.CreatedAt,
                UpdatedAt = reply.UpdatedAt
            }).ToList();

            // Create response
            var response = new SubCommentsResponseDto
            {
                ParentCommentId = request.ParentCommentId,
                TotalReplies = totalReplies,
                CurrentPage = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasNextPage = request.Page < totalPages,
                HasPreviousPage = request.Page > 1,
                Replies = replyDtos
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<SubCommentsResponseDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}