using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Posts.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.GetPostById;

public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, Result<CompletePostDto?>>
{
    private readonly AsalaDbContext _context;

    public GetPostByIdQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CompletePostDto?>> Handle(
        GetPostByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate request
            if (request.Id <= 0)
                return Result.Failure<CompletePostDto?>(MessageCodes.INVALID_INPUT);

            // Validate language
            var language = await ValidateAndGetLanguageAsync(request.LanguageCode, cancellationToken);
            if (language == null)
                return Result.Failure<CompletePostDto?>(MessageCodes.LANGUAGE_NOT_FOUND);

            // Build query to get the complete post with all related data
            var query = _context.BasePosts
                .Include(bp => bp.User)
                .Include(bp => bp.PostType)
                .Include(bp => bp.PostMedias.Where(m => !m.IsDeleted))
                .Include(bp => bp.Localizations.Where(l => l.IsActive && !l.IsDeleted))
                    .ThenInclude(l => l.Language)
                .Include(bp => bp.Article)
                .Include(bp => bp.Reel)
                .Include(bp => bp.NormalPost)
                .Where(bp => bp.Id == request.Id && !bp.IsDeleted);

            // Filter by active status if needed
            if (!request.IncludeInactive)
                query = query.Where(bp => bp.IsActive);

            // Get the post
            var post = await query.FirstOrDefaultAsync(cancellationToken);

            if (post == null)
                return Result.Failure<CompletePostDto?>(MessageCodes.POST_NOT_FOUND);

            // Map to complete DTO with all information
            var dto = MapToCompleteDto(post, language);

            return Result.Success<CompletePostDto?>(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CompletePostDto?>(
                MessageCodes.INTERNAL_SERVER_ERROR,
                ex
            );
        }
    }

    private async Task<Language?> ValidateAndGetLanguageAsync(string languageCode, CancellationToken cancellationToken)
    {
        return await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == languageCode && l.IsActive && !l.IsDeleted, cancellationToken);
    }

    private static CompletePostDto MapToCompleteDto(BasePost post, Language language)
    {
        return new CompletePostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserName = post.User?.Name ?? string.Empty,
            Description = GetLocalizedDescription(post, language),
            NumberOfReactions = post.NumberOfReactions,
            NumberOfComments = post.NumberOfComments,
            PostTypeId = post.PostTypeId,
            PostTypeName = post.PostType?.Name ?? string.Empty,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PostMedias = post.PostMedias
                .OrderBy(m => m.DisplayOrder)
                .Select(m => new PostMediaDto
                {
                    Id = m.Id,
                    Url = m.Url,
                    MediaType = (int)m.MediaType,
                    DisplayOrder = m.DisplayOrder,
                })
                .ToList(),
            Localizations = post.Localizations
                .Select(l => new PostLocalizationDto
                {
                    Id = l.Id,
                    LanguageId = l.LanguageId,
                    Description = l.Description,
                    LanguageName = l.Language?.Name ?? string.Empty,
                    LanguageCode = l.Language?.Code ?? string.Empty,
                })
                .ToList(),
            // Map post type specific data
            Reel = post.Reel != null ? new ReelDto
            {
                PostId = post.Reel.PostId,
                ExpirationDate = post.Reel.ExpirationDate
            } : null,
            Article = post.Article != null ? new ArticleDto
            {
                PostId = post.Article.PostId
            } : null,
            NormalPost = post.NormalPost != null ? new NormalPostDto
            {
                PostId = post.NormalPost.PostId
            } : null
        };
    }

    /// <summary>
    /// Gets localized description with fallback to original description
    /// </summary>
    private static string GetLocalizedDescription(BasePost post, Language language)
    {
        var localization = post.Localizations
            .FirstOrDefault(l => l.LanguageId == language.Id && l.IsActive && !l.IsDeleted);
        return localization?.Description ?? post.Description;
    }
}
