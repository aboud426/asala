using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.CreateArticle;

public class CreateArticleCommandHandler : IRequestHandler<CreateArticleCommand, Result<ArticleDto>>
{
    private readonly IMediator _mediator;
    private readonly AsalaDbContext _context;

    public CreateArticleCommandHandler(IMediator mediator, AsalaDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    public async Task<Result<ArticleDto>> Handle(
        CreateArticleCommand request,
        CancellationToken cancellationToken
    )
    {
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
                return Result.Failure<ArticleDto>(
                    basePostResult.MessageCode,
                    basePostResult.Exception
                );
            }

            // Create the Article entry
            var article = new Article { PostId = basePostResult.Value.Id };

            _context.Articles.Add(article);
            await _context.SaveChangesAsync(cancellationToken);

            // Return the ArticleDto with the BasePost data
            var articleDto = new ArticleDto
            {
                PostId = article.PostId,
                BasePost = basePostResult.Value,
            };

            return Result.Success(articleDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<ArticleDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
