using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Users.FollowUser;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, Result<FollowerDto>>
{
    private readonly AsalaDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public FollowUserCommandHandler(AsalaDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<FollowerDto>> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        // Validate input
        if (request.FollowerId <= 0)
            return Result.Failure<FollowerDto>("Invalid follower ID");

        if (request.FollowingId <= 0)
            return Result.Failure<FollowerDto>("Invalid following ID");

        if (request.FollowerId == request.FollowingId)
            return Result.Failure<FollowerDto>("Cannot follow yourself");

        // Check if both users exist
        var followerUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.FollowerId && u.IsActive && !u.IsDeleted, cancellationToken);

        if (followerUser == null)
            return Result.Failure<FollowerDto>("Follower user not found or inactive");

        var followingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.FollowingId && u.IsActive && !u.IsDeleted, cancellationToken);

        if (followingUser == null)
            return Result.Failure<FollowerDto>("Following user not found or inactive");

        // Check if already following
        var existingFollow = await _context.Followers
            .FirstOrDefaultAsync(f => f.FollowerId == request.FollowerId && 
                                    f.FollowingId == request.FollowingId && 
                                    f.IsActive && !f.IsDeleted, cancellationToken);

        if (existingFollow != null)
            return Result.Failure<FollowerDto>("Already following this user");

        // Create new follow relationship
        var follower = new Follower
        {
            FollowerId = request.FollowerId,
            FollowingId = request.FollowingId,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Followers.Add(follower);

        // Update follower counts
        followerUser.FollowingCount++;
        followingUser.FollowersCount++;

        followerUser.UpdatedAt = DateTime.UtcNow;
        followingUser.UpdatedAt = DateTime.UtcNow;

        // Save changes
        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<FollowerDto>("Failed to save follow relationship");

        // Return the created follower relationship
        var followerDto = new FollowerDto
        {
            Id = follower.Id,
            FollowerId = follower.FollowerId,
            FollowingId = follower.FollowingId,
            FollowerName = followerUser.Name,
            FollowingName = followingUser.Name,
            IsActive = follower.IsActive,
            CreatedAt = follower.CreatedAt
        };

        return Result.Success(followerDto);
    }
}
