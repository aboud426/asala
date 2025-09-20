using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Users.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.CreateBasePost;

public class CreateBasePostCommandHandler
    : IRequestHandler<CreateBasePostCommand, Result<BasePostDto>>
{
    private readonly AsalaDbContext _context;

    public CreateBasePostCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BasePostDto>> Handle(
        CreateBasePostCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return validationResult;

            // Create and save base post
            var basePost = CreateBasePostEntity(request);
            await SaveBasePostWithMediaAsync(basePost, request, cancellationToken);

            // Save localizations if any
            if (request.Localizations.Any())
            {
                await SaveLocalizationsAsync(basePost.Id, request, cancellationToken);
            }

            // Retrieve and return result
            return await GetCreatedPostResultAsync(basePost.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure<BasePostDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result<BasePostDto>> ValidateRequestAsync(
        CreateBasePostCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate PostType exists
        if (
            !await _context.PostTypes.AnyAsync(
                pt => pt.Id == request.PostTypeId && pt.IsActive,
                cancellationToken
            )
        )
        {
            return Result.Failure<BasePostDto>(MessageCodes.NOT_FOUND);
        }

        // Validate User exists
        if (
            !await _context.Users.AnyAsync(
                u => u.Id == request.UserId && u.IsActive,
                cancellationToken
            )
        )
        {
            return Result.Failure<BasePostDto>(MessageCodes.NOT_FOUND);
        }

        // Validate languages if localizations are provided
        if (request.Localizations.Any())
        {
            var languageIds = request.Localizations.Select(l => l.LanguageId).Distinct();
            var validLanguageIds = await _context
                .Languages.Where(l => languageIds.Contains(l.Id) && l.IsActive)
                .Select(l => l.Id)
                .ToListAsync(cancellationToken);

            if (validLanguageIds.Count != languageIds.Count())
            {
                return Result.Failure<BasePostDto>(MessageCodes.NOT_FOUND);
            }
        }

        return Result.Success<BasePostDto>(new BasePostDto { });
    }

    private static BasePost CreateBasePostEntity(CreateBasePostCommand request)
    {
        return new BasePost
        {
            UserId = request.UserId,
            Description = request.Description,
            NumberOfReactions = 0,
            PostTypeId = request.PostTypeId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true,
        };
    }

    private async Task SaveBasePostWithMediaAsync(
        BasePost basePost,
        CreateBasePostCommand request,
        CancellationToken cancellationToken
    )
    {
        _context.BasePosts.Add(basePost);

        if (request.MediaUrls.Any())
        {
            basePost.PostMedias = request
                .MediaUrls.Select(m => new BasePostMedia
                {
                    Url = m.Url,
                    MediaType = m.MediaType,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true,
                    DisplayOrder = m.DisplayOrder,
                })
                .ToList();
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task SaveLocalizationsAsync(
        long postId,
        CreateBasePostCommand request,
        CancellationToken cancellationToken
    )
    {
        var localizations = request
            .Localizations.Select(l => new BasePostLocalized
            {
                PostId = postId,
                LanguageId = l.LanguageId,
                Description = l.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
            })
            .ToList();

        _context.BasePostLocalizations.AddRange(localizations);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Result<BasePostDto>> GetCreatedPostResultAsync(
        long postId,
        CancellationToken cancellationToken
    )
    {
        var post = await _context
            .BasePosts.Include(p => p.PostMedias)
            .Include(p => p.PostType)
            .Include(p => p.PostComments)
            .FirstOrDefaultAsync(p => p.Id == postId, cancellationToken);

        var localizations = await _context
            .BasePostLocalizations.Include(l => l.Language)
            .Where(l => l.PostId == postId)
            .ToListAsync(cancellationToken);

        if (post == null)
            return Result.Failure<BasePostDto>(MessageCodes.NOT_FOUND);

        return Result.Success(MapToDto(post, localizations));
    }

    private static BasePostDto MapToDto(BasePost post, List<BasePostLocalized> localizations)
    {
        return new BasePostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = post.Description,
            NumberOfReactions = post.NumberOfReactions,
            PostTypeId = post.PostTypeId,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PostMedias = post
                .PostMedias.Select(m => new BasePostMediaDto
                {
                    Id = m.Id,
                    Url = m.Url,
                    MediaType = m.MediaType,
                    DisplayOrder = m.DisplayOrder,
                })
                .ToList(),
            Localizations = localizations
                .Select(l => new BasePostLocalizedDto
                {
                    Id = l.Id,
                    LanguageId = l.LanguageId,
                    Description = l.Description,
                    LanguageName = l.Language.Name,
                    LanguageCode = l.Language.Code,
                })
                .ToList(),
        };
    }
}
