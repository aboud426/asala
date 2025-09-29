using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Users.UnfollowUser;

public class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, Result>
{
    private readonly AsalaDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public UnfollowUserCommandHandler(AsalaDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
    {
        // Validate input
        if (request.FollowerId <= 0)
            return Result.Failure("Invalid follower ID");

        if (request.FollowingId <= 0)
            return Result.Failure("Invalid following ID");

        if (request.FollowerId == request.FollowingId)
            return Result.Failure("Cannot unfollow yourself");

        // Find the follow relationship
        var followRelationship = await _context.Followers
            .FirstOrDefaultAsync(f => f.FollowerId == request.FollowerId && 
                                    f.FollowingId == request.FollowingId && 
                                    f.IsActive && !f.IsDeleted, cancellationToken);

        if (followRelationship == null)
            return Result.Failure("Follow relationship not found");

        // Get users to update their counts
        var followerUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.FollowerId, cancellationToken);

        var followingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.FollowingId, cancellationToken);

        if (followerUser == null || followingUser == null)
            return Result.Failure("User not found");

        // Soft delete the follow relationship
        followRelationship.IsActive = false;
        followRelationship.IsDeleted = true;
        followRelationship.DeletedAt = DateTime.UtcNow;
        followRelationship.UpdatedAt = DateTime.UtcNow;

        // Update follower counts
        if (followerUser.FollowingCount > 0)
            followerUser.FollowingCount--;

        if (followingUser.FollowersCount > 0)
            followingUser.FollowersCount--;

        followerUser.UpdatedAt = DateTime.UtcNow;
        followingUser.UpdatedAt = DateTime.UtcNow;

        // Save changes
        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure("Failed to unfollow user");

        return Result.Success();
    }
}
