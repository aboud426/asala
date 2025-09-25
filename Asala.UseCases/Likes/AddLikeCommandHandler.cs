using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Likes;

public class AddLikeCommandHandler : IRequestHandler<AddLikeCommand, Result<LikeDto>>
{
    private readonly AsalaDbContext _context;

    public AddLikeCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LikeDto>> Handle(
        AddLikeCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return Result.Failure<LikeDto>(validationResult.MessageCode);

            // Check if user already liked this post
            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.BasePostId == request.BasePostId && 
                                        l.UserId == request.UserId && 
                                        l.IsActive && !l.IsDeleted, cancellationToken);

            if (existingLike != null)
            {
                // User already liked this post, return the existing like
                var existingLikeDto = await GetLikeWithUserAsync(existingLike.Id, cancellationToken);
                return Result.Success(existingLikeDto);
            }

            // Create new like
            var like = new Like
            {
                UserId = request.UserId,
                BasePostId = request.BasePostId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Likes.Add(like);

            // Update BasePost's NumberOfReactions
            await UpdateBasePostReactionCountAsync(request.BasePostId, cancellationToken);

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            // Return the created like with user information
            var result = await GetLikeWithUserAsync(like.Id, cancellationToken);
            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<LikeDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result> ValidateRequestAsync(
        AddLikeCommand request,
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
            basePost.NumberOfReactions++;
            basePost.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task<LikeDto> GetLikeWithUserAsync(long likeId, CancellationToken cancellationToken)
    {
        var like = await _context.Likes
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == likeId, cancellationToken);

        return new LikeDto
        {
            Id = like!.Id,
            UserId = like.UserId,
            UserName = like.User.Name,
            BasePostId = like.BasePostId,
            IsActive = like.IsActive,
            CreatedAt = like.CreatedAt,
            UpdatedAt = like.UpdatedAt
        };
    }
}
