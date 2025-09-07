using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Posts.DTOs;
using Asala.Core.Modules.Posts.Models;

namespace Asala.UseCases.Posts;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IPostLocalizedRepository _postLocalizedRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PostService(
        IPostRepository postRepository,
        IPostLocalizedRepository postLocalizedRepository,
        IUnitOfWork unitOfWork
    )
    {
        _postRepository = postRepository;
        _postLocalizedRepository = postLocalizedRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<PostDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<PostDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<PostDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<PostDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PostDto?>(idValidationResult.MessageCode);

        var postResult = await _postRepository.GetByIdWithLocalizationsAsync(id, cancellationToken);
        if (postResult.IsFailure)
            return Result.Failure<PostDto?>(postResult.MessageCode);

        if (postResult.Value == null || postResult.Value.IsDeleted)
            return Result.Failure<PostDto?>(MessageCodes.POST_NOT_FOUND);

        var postDto = MapToDto(postResult.Value);
        return Result.Success<PostDto?>(postDto);
    }

    public async Task<Result<PostDto>> CreateAsync(
        CreatePostDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreatePostDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<PostDto>(validationResult.MessageCode);

        var post = new Post
        {
            UserId = createDto.UserId,
            Description = createDto.Description.Trim(),
            NumberOfReactions = createDto.NumberOfReactions,
            PostTypeId = createDto.PostTypeId,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PostLocalizeds = CreateLocalizations(createDto.Localizations),
        };

        var addResult = await _postRepository.AddAsync(post, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<PostDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostDto>(saveResult.MessageCode);

        // Get the created post with its localizations
        var createdPostResult = await _postRepository.GetByIdWithLocalizationsAsync(
            addResult.Value.Id,
            cancellationToken
        );

        if (createdPostResult.IsFailure || createdPostResult.Value == null)
            return Result.Failure<PostDto>(MessageCodes.POST_NOT_FOUND);

        var dto = MapToDto(createdPostResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<PostDto?>> UpdateAsync(
        int id,
        UpdatePostDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PostDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdatePostDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<PostDto?>(validationResult.MessageCode);

        // Get existing post
        var getResult = await _postRepository.GetByIdWithLocalizationsAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<PostDto?>(getResult.MessageCode);

        var post = getResult.Value;
        if (post == null)
            return Result.Success<PostDto?>(null);

        // Update post properties
        post.Description = updateDto.Description.Trim();
        post.NumberOfReactions = updateDto.NumberOfReactions;
        post.PostTypeId = updateDto.PostTypeId;
        post.IsActive = updateDto.IsActive;
        post.UpdatedAt = DateTime.UtcNow;

        // Handle localizations
        UpdateLocalizations(post, updateDto.Localizations);

        var updateResult = _postRepository.Update(post);
        if (updateResult.IsFailure)
            return Result.Failure<PostDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostDto?>(saveResult.MessageCode);

        var dto = MapToDto(post);
        return Result.Success<PostDto?>(dto);
    }

    public async Task<Result<PostDto?>> CreateWithMediaAsync(
        CreatePostWithMediaDto createDto,
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreatePostWithMediaDto(createDto, userId);
        if (validationResult.IsFailure)
            return Result.Failure<PostDto?>(validationResult.MessageCode);

        var post = new Post
        {
            UserId = userId,
            Description = createDto.Description?.Trim() ?? string.Empty,
            NumberOfReactions = 0, // Default value for new posts
            PostTypeId = createDto.PostTypeId,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PostLocalizeds = CreateLocalizations(createDto.Localizations),
        };

        // TODO: Handle media URLs - for now we store them in description or separate table
        // This would require a PostMedia table implementation
        var mediaInfo = createDto.MediaUrls.Any()
            ? $"\n\nMedia URLs: {string.Join(", ", createDto.MediaUrls)}"
            : "";
        post.Description = $"{post.Description}{mediaInfo}".Trim();

        var addResult = await _postRepository.AddAsync(post, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<PostDto?>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostDto?>(saveResult.MessageCode);

        // Get the created post with its localizations
        var createdPostResult = await _postRepository.GetByIdWithLocalizationsAsync(
            addResult.Value.Id,
            cancellationToken
        );

        if (createdPostResult.IsFailure || createdPostResult.Value == null)
            return Result.Failure<PostDto?>(MessageCodes.POST_NOT_FOUND);

        var dto = MapToDto(createdPostResult.Value);
        return Result.Success<PostDto?>(dto);
    }

    public async Task<Result<PaginatedResult<PostDto>>> GetPaginatedLocalizedAsync(
        int page,
        int pageSize,
        string languageCode,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        // Validate inputs
        if (page <= 0)
            return Result.Failure<PaginatedResult<PostDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize <= 0)
            return Result.Failure<PaginatedResult<PostDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        if (string.IsNullOrWhiteSpace(languageCode))
            languageCode = "en"; // Default to English

        var result = await _postRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<PostDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(post =>
            MapToDtoWithPreferredLanguage(post, languageCode)
        );
        var paginatedDto = new PaginatedResult<PostDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    #region Private Helper Methods

    private static List<PostLocalized> CreateLocalizations(
        List<CreatePostLocalizedDto> localizationDtos
    )
    {
        return localizationDtos
            .Select(dto => new PostLocalized
            {
                DescriptionLocalized = dto.DescriptionLocalized.Trim(),
                LanguageId = dto.LanguageId,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();
    }

    private static void UpdateLocalizations(
        Post post,
        List<UpdatePostLocalizedDto> localizationDtos
    )
    {
        var now = DateTime.UtcNow;

        // Handle existing localizations
        foreach (var existingLocalization in post.PostLocalizeds)
        {
            var updatedDto = localizationDtos.FirstOrDefault(dto =>
                dto.Id == existingLocalization.Id
            );
            if (updatedDto != null)
            {
                // Update existing localization
                existingLocalization.DescriptionLocalized = updatedDto.DescriptionLocalized.Trim();
                existingLocalization.LanguageId = updatedDto.LanguageId;
                existingLocalization.IsActive = updatedDto.IsActive;
                existingLocalization.UpdatedAt = now;
            }
            else
            {
                // Mark for deletion if not in the update list
                existingLocalization.IsDeleted = true;
                existingLocalization.DeletedAt = now;
                existingLocalization.UpdatedAt = now;
            }
        }

        // Add new localizations (those with null or 0 Id)
        var newLocalizations = localizationDtos
            .Where(dto => !dto.Id.HasValue || dto.Id.Value == 0)
            .Select(dto => new PostLocalized
            {
                DescriptionLocalized = dto.DescriptionLocalized.Trim(),
                LanguageId = dto.LanguageId,
                IsActive = dto.IsActive,
                CreatedAt = now,
                UpdatedAt = now,
            });

        foreach (var newLocalization in newLocalizations)
        {
            post.PostLocalizeds.Add(newLocalization);
        }
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.POST_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreatePostDto(CreatePostDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate UserId
        if (createDto.UserId <= 0)
            return Result.Failure(MessageCodes.POST_USER_ID_REQUIRED);

        // Validate Description
        if (string.IsNullOrWhiteSpace(createDto.Description))
            return Result.Failure(MessageCodes.POST_DESCRIPTION_REQUIRED);

        if (createDto.Description.Length > 2000)
            return Result.Failure(MessageCodes.POST_DESCRIPTION_TOO_LONG);

        // Validate PostTypeId
        if (createDto.PostTypeId <= 0)
            return Result.Failure(MessageCodes.POST_POSTTYPE_ID_REQUIRED);

        // Validate localizations
        var localizationValidation = ValidateLocalizations(createDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateUpdatePostDto(UpdatePostDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Description
        if (string.IsNullOrWhiteSpace(updateDto.Description))
            return Result.Failure(MessageCodes.POST_DESCRIPTION_REQUIRED);

        if (updateDto.Description.Length > 2000)
            return Result.Failure(MessageCodes.POST_DESCRIPTION_TOO_LONG);

        // Validate PostTypeId
        if (updateDto.PostTypeId <= 0)
            return Result.Failure(MessageCodes.POST_POSTTYPE_ID_REQUIRED);

        // Validate localizations
        var localizationValidation = ValidateUpdateLocalizations(updateDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateCreatePostWithMediaDto(CreatePostWithMediaDto createDto, int userId)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate UserId
        if (userId <= 0)
            return Result.Failure(MessageCodes.POST_USER_ID_REQUIRED);

        // Description is optional for media posts, but if provided, validate length
        if (!string.IsNullOrWhiteSpace(createDto.Description) && createDto.Description.Length > 2000)
            return Result.Failure(MessageCodes.POST_DESCRIPTION_TOO_LONG);

        // Validate PostTypeId
        if (createDto.PostTypeId <= 0)
            return Result.Failure(MessageCodes.POST_POSTTYPE_ID_REQUIRED);

        // Validate ProviderId
        if (createDto.ProviderId <= 0)
            return Result.Failure(MessageCodes.POST_USER_ID_REQUIRED); // Reusing message for provider

        // Validate localizations
        if (createDto.Localizations?.Any() == true)
        {
            var localizationValidation = ValidateLocalizations(createDto.Localizations);
            if (localizationValidation.IsFailure)
                return localizationValidation;
        }

        return Result.Success();
    }

    private static Result ValidateLocalizations(List<CreatePostLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.DescriptionLocalized))
                return Result.Failure(MessageCodes.POST_LOCALIZED_DESCRIPTION_REQUIRED);

            if (localization.DescriptionLocalized.Length > 2000)
                return Result.Failure(MessageCodes.POST_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.POST_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    private static Result ValidateUpdateLocalizations(List<UpdatePostLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.DescriptionLocalized))
                return Result.Failure(MessageCodes.POST_LOCALIZED_DESCRIPTION_REQUIRED);

            if (localization.DescriptionLocalized.Length > 2000)
                return Result.Failure(MessageCodes.POST_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.POST_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static PostDto MapToDto(Post post)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = post.Description,
            NumberOfReactions = post.NumberOfReactions,
            PostTypeId = post.PostTypeId,
            PostTypeName = post.PostType?.Name ?? string.Empty,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            Localizations = post
                .PostLocalizeds.Where(l => !l.IsDeleted)
                .Select(MapLocalizationToDto)
                .ToList(),
        };
    }

    private static PostLocalizedDto MapLocalizationToDto(PostLocalized localization)
    {
        return new PostLocalizedDto
        {
            Id = localization.Id,
            PostId = localization.PostId,
            LanguageId = localization.LanguageId,
            LanguageCode = localization.Language?.Code ?? string.Empty,
            LanguageName = localization.Language?.Name ?? string.Empty,
            DescriptionLocalized = localization.DescriptionLocalized,
            IsActive = localization.IsActive,
            CreatedAt = localization.CreatedAt,
            UpdatedAt = localization.UpdatedAt,
        };
    }

    private static PostDto MapToDtoWithPreferredLanguage(Post post, string preferredLanguageCode)
    {
        var activeLocalizations = post
            .PostLocalizeds.Where(l => !l.IsDeleted && l.IsActive)
            .ToList();

        // Try to find a localization for the preferred language
        var preferredLocalization = activeLocalizations
            .FirstOrDefault(l => l.Language?.Code?.Equals(preferredLanguageCode, StringComparison.OrdinalIgnoreCase) == true);

        // If we have a preferred localization, use its description as the main description
        var displayDescription = preferredLocalization?.DescriptionLocalized ?? post.Description;

        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Description = displayDescription,
            NumberOfReactions = post.NumberOfReactions,
            PostTypeId = post.PostTypeId,
            PostTypeName = post.PostType?.Name ?? string.Empty,
            IsActive = post.IsActive,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            Localizations = activeLocalizations
                .Select(MapLocalizationToDto)
                .ToList(),
        };
    }

    #endregion
}
