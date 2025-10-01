using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.GetPostsPaginated;

public class GetPostsPaginatedQueryHandler 
    : IRequestHandler<GetPostsPaginatedQuery, Result<PaginatedResult<BasePostDto>>>
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly AsalaDbContext _context;

    public GetPostsPaginatedQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<BasePostDto>>> Handle(
        GetPostsPaginatedQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate request
            var validationResult = ValidateRequest(request);
            if (validationResult.IsFailure)
                return Result.Failure<PaginatedResult<BasePostDto>>(validationResult.MessageCode);

            // Validate language
            var language = await ValidateAndGetLanguageAsync(request.LanguageCode, cancellationToken);
            if (language == null)
                return Result.Failure<PaginatedResult<BasePostDto>>(MessageCodes.LANGUAGE_NOT_FOUND);

            // Build query
            var query = BuildQuery(request);

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var skip = (request.Page - 1) * request.PageSize;
            var posts = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs with localization
            var dtos = MapToDto(posts, language);

            // Create paginated result
            var paginatedResult = new PaginatedResult<BasePostDto>(
                items: dtos,
                totalCount: totalCount,
                page: request.Page,
                pageSize: request.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<BasePostDto>>(
                MessageCodes.INTERNAL_SERVER_ERROR,
                ex
            );
        }
    }

    private Result ValidateRequest(GetPostsPaginatedQuery request)
    {
        if (request.Page < MinPage)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE);

        if (request.PageSize < MinPageSize || request.PageSize > MaxPageSize)
            return Result.Failure(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        if (request.PostTypeId.HasValue && request.PostTypeId <= 0)
            return Result.Failure(MessageCodes.POST_POSTTYPE_ID_INVALID);

        if (!string.IsNullOrEmpty(request.Type) && !IsValidPostType(request.Type))
            return Result.Failure(MessageCodes.INVALID_INPUT);

        return Result.Success();
    }

    private static bool IsValidPostType(string type)
    {
        var validTypes = new[] { "reel", "normal", "article" };
        return validTypes.Contains(type.ToLower());
    }

    private async Task<Language?> ValidateAndGetLanguageAsync(string languageCode, CancellationToken cancellationToken)
    {
        return await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == languageCode && l.IsActive && !l.IsDeleted, cancellationToken);
    }

    private IQueryable<BasePost> BuildQuery(GetPostsPaginatedQuery request)
    {
        var query = _context.BasePosts
            .Include(bp => bp.User)
            .Include(bp => bp.PostType)
            .Include(bp => bp.PostMedias.Where(m => !m.IsDeleted))
            .Include(bp => bp.Localizations.Where(l => l.IsActive && !l.IsDeleted))
            .Include(bp => bp.Article)
            .Include(bp => bp.Reel)
            .Include(bp => bp.NormalPost)
            .AsQueryable();

        // Filter by deleted status
        query = query.Where(bp => !bp.IsDeleted);

        // Filter by active status
        if (request.ActiveOnly.HasValue)
            query = query.Where(bp => bp.IsActive == request.ActiveOnly.Value);

        // Filter by specific post type ID
        if (request.PostTypeId.HasValue)
            query = query.Where(bp => bp.PostTypeId == request.PostTypeId.Value);

        // Filter by post type (reel, normal, article)
        if (!string.IsNullOrEmpty(request.Type))
        {
            query = request.Type.ToLower() switch
            {
                "reel" => query.Where(bp => bp.Reel != null),
                "normal" => query.Where(bp => bp.NormalPost != null),
                "article" => query.Where(bp => bp.Article != null),
                _ => query
            };
        }

        // Order by creation date (newest first)
        query = query.OrderByDescending(bp => bp.CreatedAt);

        return query;
    }

    private static List<BasePostDto> MapToDto(List<BasePost> posts, Language language)
    {
        return posts.Select(post => new BasePostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = GetLocalizedDescription(post, language),
            NumberOfReactions = post.NumberOfReactions,
            NumberOfComments = post.NumberOfComments,
            PostTypeId = post.PostTypeId,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PostMedias = post.PostMedias
                .OrderBy(m => m.DisplayOrder)
                .Select(m => new BasePostMediaDto
                {
                    Id = m.Id,
                    Url = m.Url,
                    MediaType = m.MediaType,
                    DisplayOrder = m.DisplayOrder,
                })
                .ToList(),
            Localizations = post.Localizations
                .Select(l => new BasePostLocalizedDto
                {
                    Id = l.Id,
                    LanguageId = l.LanguageId,
                    Description = l.Description,
                    LanguageName = l.Language?.Name ?? string.Empty,
                    LanguageCode = l.Language?.Code ?? string.Empty,
                })
                .ToList(),
        }).ToList();
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
