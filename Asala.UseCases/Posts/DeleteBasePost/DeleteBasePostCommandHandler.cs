using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.DeleteBasePost;

public class DeleteBasePostCommandHandler : IRequestHandler<DeleteBasePostCommand, Result>
{
    private readonly AsalaDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBasePostCommandHandler(AsalaDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteBasePostCommand request, CancellationToken cancellationToken)
    {
        // Validate input
        if (request.PostId <= 0)
            return Result.Failure("Invalid post ID");

        // Find the base post
        var basePost = await _context.BasePosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId && p.IsActive && !p.IsDeleted, cancellationToken);

        if (basePost == null)
            return Result.Failure("Post not found");

        // Get the user to update post count
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == basePost.UserId, cancellationToken);

        if (user == null)
            return Result.Failure("User not found");

        // Soft delete the base post
        basePost.IsActive = false;
        basePost.IsDeleted = true;
        basePost.DeletedAt = DateTime.UtcNow;
        basePost.UpdatedAt = DateTime.UtcNow;

        // Decrement user post count
        if (user.NumberOfPosts > 0)
            user.NumberOfPosts--;

        user.UpdatedAt = DateTime.UtcNow;

        // Save changes
        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure("Failed to delete post");

        return Result.Success();
    }
}
