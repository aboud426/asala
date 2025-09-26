using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.CreateNormalPost;

public class CreateNormalPostCommandHandler : IRequestHandler<CreateNormalPostCommand, Result<NormalPostDto>>
{
    private readonly IMediator _mediator;
    private readonly AsalaDbContext _context;

    public CreateNormalPostCommandHandler(IMediator mediator, AsalaDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    public async Task<Result<NormalPostDto>> Handle(
        CreateNormalPostCommand request,
        CancellationToken cancellationToken
    )
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Create the base post first using the existing CreateBasePostCommand
            var createBasePostCommand = new CreateBasePostCommand
            {
                UserId = request.UserId,
                Description = request.Description,
                PostTypeId = request.PostTypeId,
                MediaUrls = request.MediaUrls,
                Localizations = request.Localizations,
            };

            var basePostResult = await _mediator.Send(createBasePostCommand, cancellationToken);

            if (basePostResult.IsFailure)
            {
                return Result.Failure<NormalPostDto>(
                    basePostResult.MessageCode,
                    basePostResult.Exception
                );
            }

            // Create the NormalPost entry
            var normalPost = new NormalPost { PostId = basePostResult.Value.Id };

            _context.NormalPosts.Add(normalPost);
            await _context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            // Return the NormalPostDto with the BasePost data
            return Result.Success(
                new NormalPostDto { PostId = normalPost.PostId, BasePost = basePostResult.Value }
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure<NormalPostDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
