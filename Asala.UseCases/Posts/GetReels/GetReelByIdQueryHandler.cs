using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.UseCases.Posts.CreateBasePost;
using Asala.UseCases.Posts.CreateReel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts.GetReels;

public class GetReelByIdQueryHandler : IRequestHandler<GetReelByIdQuery, Result<ReelDto>>
{
    private readonly AsalaDbContext _context;

    public GetReelByIdQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReelDto>> Handle(
        GetReelByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Find the BasePost that has a Reel with the specified ID
            var basePost = await _context
                .BasePosts.Include(bp => bp.PostMedias)
                .Include(bp => bp.Reel)
                .Where(bp => bp.Id == request.Id && bp.Reel != null && !bp.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (basePost == null)
                return Result.Failure<ReelDto>(MessageCodes.NOT_FOUND);

            // Get localizations for the post
            var localizations = await _context
                .BasePostLocalizations.Include(l => l.Language)
                .Where(l => l.PostId == basePost.Id && !l.IsDeleted)
                .ToListAsync(cancellationToken);

            // Map to ReelDto
            var reelDto = MapToReelDto(basePost, localizations);

            return Result.Success(reelDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<ReelDto>(MessageCodes.INTERNAL_SERVER_ERROR);
        }
    }

    private static ReelDto MapToReelDto(BasePost basePost, List<BasePostLocalized> localizations)
    {
        var basePostDto = new BasePostDto
        {
            Id = basePost.Id,
            UserId = basePost.UserId,
            Description = basePost.Description,
            NumberOfReactions = basePost.NumberOfReactions,
            NumberOfComments = basePost.NumberOfComments,
            PostTypeId = basePost.PostTypeId,
            IsActive = basePost.IsActive,
            CreatedAt = basePost.CreatedAt,
            UpdatedAt = basePost.UpdatedAt,
            PostMedias = basePost
                .PostMedias.Where(pm => !pm.IsDeleted)
                .OrderBy(pm => pm.DisplayOrder)
                .Select(pm => new BasePostMediaDto
                {
                    Id = pm.Id,
                    Url = pm.Url,
                    MediaType = pm.MediaType,
                    DisplayOrder = pm.DisplayOrder,
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

        return new ReelDto 
        { 
            PostId = basePost.Id, 
            ExpirationDate = basePost.Reel!.ExpirationDate,
            BasePost = basePostDto 
        };
    }
}
