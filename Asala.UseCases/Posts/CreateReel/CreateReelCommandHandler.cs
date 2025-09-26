using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.CreateReel;

public class CreateReelCommandHandler : IRequestHandler<CreateReelCommand, Result<ReelDto>>
{
    private readonly IMediator _mediator;
    private readonly AsalaDbContext _context;

    public CreateReelCommandHandler(IMediator mediator, AsalaDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    public async Task<Result<ReelDto>> Handle(
        CreateReelCommand request,
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
                return Result.Failure<ReelDto>(
                    basePostResult.MessageCode,
                    basePostResult.Exception
                );
            }

            // Create the Reel entry with expiration date set to CreatedAt + 24 hours
            var expirationDate = basePostResult.Value.CreatedAt.AddHours(24);
            var reel = new Reel 
            { 
                PostId = basePostResult.Value.Id,
                ExpirationDate = expirationDate
            };

            _context.Reels.Add(reel);
            await _context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            // Return the ReelDto with the BasePost data
            var reelDto = new ReelDto 
            { 
                PostId = reel.PostId, 
                ExpirationDate = reel.ExpirationDate,
                BasePost = basePostResult.Value 
            };

            return Result.Success(reelDto);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure<ReelDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
