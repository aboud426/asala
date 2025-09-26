using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Comments;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, Result<CommentDto>>
{
    private readonly AsalaDbContext _context;

    public CreateCommentCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CommentDto>> Handle(
        CreateCommentCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return Result.Failure<CommentDto>(validationResult.MessageCode);

            // Create comment
            var comment = new Comment
            {
                UserId = request.UserId,
                BasePostId = request.BasePostId,
                Content = request.Content.Trim(),
                ParentId = request.ParentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            // Update BasePost's NumberOfComments
            await UpdateBasePostCommentCountAsync(request.BasePostId, cancellationToken);

            // Update parent comment's NumberOfReplies if this is a reply
            if (request.ParentId.HasValue)
            {
                await UpdateParentCommentReplyCountAsync(request.ParentId.Value, cancellationToken);
            }

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            // Return the created comment with user information
            var result = await GetCommentWithUserAsync(comment.Id, cancellationToken);
            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<CommentDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result> ValidateRequestAsync(
        CreateCommentCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate content
        if (string.IsNullOrWhiteSpace(request.Content))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        if (request.Content.Trim().Length > 1000)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        // Validate user exists
        var userExists = await _context.Users
            .AnyAsync(u => u.Id == request.UserId && u.IsActive && !u.IsDeleted, cancellationToken);
        if (!userExists)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        // Validate BasePost exists
        var basePostExists = await _context.BasePosts
            .AnyAsync(bp => bp.Id == request.BasePostId && bp.IsActive && !bp.IsDeleted, cancellationToken);
        if (!basePostExists)
            return Result.Failure(MessageCodes.NOT_FOUND);

        // Validate parent comment exists if provided
        if (request.ParentId.HasValue)
        {
            var parentExists = await _context.Comments
                .AnyAsync(c => c.Id == request.ParentId.Value && 
                              c.BasePostId == request.BasePostId && 
                              c.IsActive && !c.IsDeleted, cancellationToken);
            if (!parentExists)
                return Result.Failure(MessageCodes.NOT_FOUND);
        }

        return Result.Success();
    }

    private async Task UpdateBasePostCommentCountAsync(long basePostId, CancellationToken cancellationToken)
    {
        var basePost = await _context.BasePosts
            .FirstOrDefaultAsync(bp => bp.Id == basePostId, cancellationToken);

        if (basePost != null)
        {
            basePost.NumberOfComments++;
            basePost.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task UpdateParentCommentReplyCountAsync(long parentCommentId, CancellationToken cancellationToken)
    {
        var parentComment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == parentCommentId, cancellationToken);

        if (parentComment != null)
        {
            parentComment.NumberOfReplies++;
            parentComment.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task<CommentDto> GetCommentWithUserAsync(long commentId, CancellationToken cancellationToken)
    {
        var comment = await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);

        return new CommentDto
        {
            Id = comment!.Id,
            UserId = comment.UserId,
            UserName = comment.User.Name,
            BasePostId = comment.BasePostId,
            Content = comment.Content,
            ParentId = comment.ParentId,
            NumberOfReplies = comment.NumberOfReplies,
            IsActive = comment.IsActive,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}
