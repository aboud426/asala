using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.DTOs;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Media.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Db;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Posts;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostLocalizedRepository _postLocalizedRepository;
    private readonly IPostMediaRepository _postMediaRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AsalaDbContext _context;

    public PostService(
        IPostRepository postRepository,
        IPostLocalizedRepository postLocalizedRepository,
        IPostMediaRepository postMediaRepository,
        ILanguageRepository languageRepository,
        IUnitOfWork unitOfWork,
        AsalaDbContext context)
    {
        _postRepository = postRepository ?? throw new ArgumentNullException(nameof(postRepository));
        _postLocalizedRepository = postLocalizedRepository ?? throw new ArgumentNullException(nameof(postLocalizedRepository));
        _postMediaRepository = postMediaRepository ?? throw new ArgumentNullException(nameof(postMediaRepository));
        _languageRepository = languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Result<PostDto?>> CreateWithMediaAsync(CreatePostWithMediaDto createDto, int userId, CancellationToken cancellationToken = default)
    {
        // Create post
        var post = new Post
        {
            UserId = userId,
            Description = createDto.Description?.Trim(),
            NumberOfReactions = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var addPostResult = await _postRepository.AddAsync(post, cancellationToken);
        if (addPostResult.IsFailure)
            return Result.Failure<PostDto?>(addPostResult.MessageCode);

        // Create media entries and link to post
        if (createDto.MediaUrls.Any())
        {
            foreach (var mediaUrl in createDto.MediaUrls.Where(url => !string.IsNullOrWhiteSpace(url)))
            {
                // Create media entry
                var media = new Media
                {
                    MediaTypeId = 1, // Default media type
                    Url = mediaUrl.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Medias.Add(media);
                await _context.SaveChangesAsync(cancellationToken);

                // Link media to post
                var postMedia = new PostMedia
                {
                    PostId = addPostResult.Value.Id,
                    MediaId = media.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _postMediaRepository.AddAsync(postMedia, cancellationToken);
            }
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostDto?>(saveResult.MessageCode);

        var dto = MapToDto(addPostResult.Value);
        return Result.Success<PostDto?>(dto);
    }

    public async Task<Result<PaginatedResult<PostDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        // Get language by code
        var languageResult = await _languageRepository.GetFirstOrDefaultAsync(
            filter: l => l.Code == languageCode && l.IsActive && !l.IsDeleted);
        if (languageResult.IsFailure || languageResult.Value == null)
            return Result.Failure<PaginatedResult<PostDto>>(MessageCodes.LANGUAGE_NOT_FOUND);

        var language = languageResult.Value;

        // Build filter
        Expression<Func<Post, bool>> filter = activeOnly switch
        {
            true => p => p.IsActive && !p.IsDeleted,
            false => p => !p.IsActive && !p.IsDeleted,
            null => p => !p.IsDeleted,
        };

        // Get paginated posts
        var postsResult = await _postRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter,
            orderBy: q => q.OrderByDescending(p => p.CreatedAt)
        );

        if (postsResult.IsFailure)
            return Result.Failure<PaginatedResult<PostDto>>(postsResult.MessageCode);

        // Get localized data for these posts
        var postIds = postsResult.Value.Items.Select(p => p.Id).ToList();
        var localizedPosts = await _context.PostLocalizeds
            .Where(pl => postIds.Contains(pl.PostId) && pl.LanguageId == language.Id && !pl.IsDeleted)
            .ToListAsync(cancellationToken);

        // Map to DTOs with localization
        var dtos = postsResult.Value.Items.Select(post =>
        {
            var localized = localizedPosts.FirstOrDefault(pl => pl.PostId == post.Id);
            return MapToDtoWithLocalization(post, localized);
        }).ToList();

        var paginatedDto = new PaginatedResult<PostDto>(
            items: dtos,
            totalCount: postsResult.Value.TotalCount,
            page: postsResult.Value.Page,
            pageSize: postsResult.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    private static PostDto MapToDto(Post post)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = post.Description,
            NumberOfReactions = post.NumberOfReactions,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };
    }

    private static PostDto MapToDtoWithLocalization(Post post, PostLocalized? localized)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = post.Description,
            LocalizedDescription = localized?.DescriptionLocalized,
            NumberOfReactions = post.NumberOfReactions,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };
    }
}