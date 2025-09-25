using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Likes;

public class RemoveLikeCommandHandler : IRequestHandler<RemoveLikeCommand, Result<RemoveLikeDto>>
{
    private readonly AsalaDbContext _context;

    public RemoveLikeCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RemoveLikeDto>> Handle(
        RemoveLikeCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return Result.Failure<RemoveLikeDto>(validationResult.MessageCode);

            // Find existing like
            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.BasePostId == request.BasePostId && 
                                        l.UserId == request.UserId && 
                                        l.IsActive && !l.IsDeleted, cancellationToken);

            if (existingLike == null)
            {
                // User hasn't liked this post, return not removed
                return Result.Success(new RemoveLikeDto
                {
                    WasRemoved = false,
                    Message = "Like not found - user hasn't liked this post"
                });
            }

            // Soft delete the like
            existingLike.IsActive = false;
            existingLike.IsDeleted = true;
            existingLike.DeletedAt = DateTime.UtcNow;
            existingLike.UpdatedAt = DateTime.UtcNow;

            // Update BasePost's NumberOfReactions (decrement)
            await UpdateBasePostReactionCountAsync(request.BasePostId, cancellationToken);

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(new RemoveLikeDto
            {
                WasRemoved = true,
                Message = "Like removed successfully"
            });
        }
        catch (Exception ex)
        {
            return Result.Failure<RemoveLikeDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result> ValidateRequestAsync(
        RemoveLikeCommand request,
        CancellationToken cancellationToken
    )
    {
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

        return Result.Success();
    }

    private async Task UpdateBasePostReactionCountAsync(long basePostId, CancellationToken cancellationToken)
    {
        var basePost = await _context.BasePosts
            .FirstOrDefaultAsync(bp => bp.Id == basePostId, cancellationToken);

        if (basePost != null)
        {
            // Decrement reaction count, but don't go below 0
            if (basePost.NumberOfReactions > 0)
            {
                basePost.NumberOfReactions--;
            }
            basePost.UpdatedAt = DateTime.UtcNow;
        }
    }
}
