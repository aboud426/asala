using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.ClientPages.Db;
using Asala.Core.Modules.ClientPages.DTOs;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.ClientPages;

public class PostsPagesService : IPostsPagesService
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;

    private readonly IPostsPagesRepository _postsPagesRepository;
    private readonly IPostsPagesLocalizedRepository _postsPagesLocalizedRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PostsPagesService(
        IPostsPagesRepository postsPagesRepository,
        IPostsPagesLocalizedRepository postsPagesLocalizedRepository,
        IUnitOfWork unitOfWork
    )
    {
        _postsPagesRepository = postsPagesRepository;
        _postsPagesLocalizedRepository = postsPagesLocalizedRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<PostsPagesDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        if (page < MinPage)
            return Result.Failure<PaginatedResult<PostsPagesDto>>(
                MessageCodes.InvalidPage,
                $"Page must be at least {MinPage}"
            );

        if (pageSize < MinPageSize || pageSize > MaxPageSize)
            return Result.Failure<PaginatedResult<PostsPagesDto>>(
                MessageCodes.InvalidPageSize,
                $"Page size must be between {MinPageSize} and {MaxPageSize}"
            );

        try
        {
            var queryable = _postsPagesRepository.GetQueryable();

            if (activeOnly)
                queryable = queryable.Where(x => x.IsActive);

            var totalCount = await queryable.CountAsync(cancellationToken);

            var postsPages = await queryable
                .Include(x => x.Localizations.Where(l => l.IsActive))
                .Include(x => x.IncludedPostTypes)
                .ThenInclude(i => i.PostType)
                .OrderBy(x => x.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var postsPagesDto = postsPages.Select(MapToDto).ToList();

            return Result.Success(
                new PaginatedResult<PostsPagesDto>(postsPagesDto, totalCount, page, pageSize)
            );
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<PostsPagesDto>>(
                MessageCodes.InternalServerError,
                ex.Message
            );
        }
    }

    public async Task<Result<PostsPagesDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postsPages =
                await _postsPagesRepository.GetByIdWithLocalizationsAndIncludedTypesAsync(id);

            if (postsPages == null)
                return Result.Failure<PostsPagesDto>(
                    MessageCodes.NotFound,
                    "PostsPages not found"
                );

            return Result.Success(MapToDto(postsPages));
        }
        catch (Exception ex)
        {
            return Result.Failure<PostsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<PostsPagesDto>> GetByKeyAsync(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(key))
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        try
        {
            var postsPages =
                await _postsPagesRepository.GetByKeyWithLocalizationsAndIncludedTypesAsync(key);

            if (postsPages == null)
                return Result.Failure<PostsPagesDto>(
                    MessageCodes.NotFound,
                    "PostsPages not found"
                );

            return Result.Success(MapToDto(postsPages));
        }
        catch (Exception ex)
        {
            return Result.Failure<PostsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<PostsPagesDto>> CreateAsync(
        CreatePostsPagesDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Create data cannot be null"
            );

        if (string.IsNullOrWhiteSpace(createDto.Key))
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Name cannot be empty"
            );

        try
        {
            // Check if key already exists
            var existingPostsPages = await _postsPagesRepository.GetByKeyAsync(createDto.Key);
            if (existingPostsPages != null)
                return Result.Failure<PostsPagesDto>(
                    MessageCodes.AlreadyExists,
                    "PostsPages with this key already exists"
                );

            var postsPages = new PostsPages
            {
                Key = createDto.Key,
                Name = createDto.Name,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _postsPagesRepository.AddAsync(postsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Add localizations if provided
            if (createDto.Localizations?.Any() == true)
            {
                var localizations = createDto.Localizations.Select(locDto => new PostsPagesLocalized
                {
                    PostsPagesId = postsPages.Id,
                    NameLocalized = locDto.NameLocalized,
                    DescriptionLocalized = locDto.DescriptionLocalized,
                    LanguageId = locDto.LanguageId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });

                await _postsPagesLocalizedRepository.AddRangeAsync(localizations);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // Add included post types if provided
            if (createDto.IncludedPostTypeIds?.Any() == true)
            {
                await _postsPagesRepository.AddIncludedPostTypesAsync(
                    postsPages.Id,
                    createDto.IncludedPostTypeIds
                );
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            var result = await GetByIdAsync(postsPages.Id, cancellationToken);
            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure<PostsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<PostsPagesDto>> UpdateAsync(
        int id,
        UpdatePostsPagesDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (updateDto == null)
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Update data cannot be null"
            );

        if (string.IsNullOrWhiteSpace(updateDto.Key))
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Key cannot be empty"
            );

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure<PostsPagesDto>(
                MessageCodes.InvalidInput,
                "Name cannot be empty"
            );

        try
        {
            var postsPages = await _postsPagesRepository.GetByIdAsync(id);
            if (postsPages == null)
                return Result.Failure<PostsPagesDto>(
                    MessageCodes.NotFound,
                    "PostsPages not found"
                );

            // Check if key already exists (excluding current entity)
            var existingWithKey = await _postsPagesRepository.GetByKeyAsync(updateDto.Key);
            if (existingWithKey != null && existingWithKey.Id != id)
                return Result.Failure<PostsPagesDto>(
                    MessageCodes.AlreadyExists,
                    "PostsPages with this key already exists"
                );

            postsPages.Key = updateDto.Key;
            postsPages.Name = updateDto.Name;
            postsPages.Description = updateDto.Description;
            postsPages.IsActive = updateDto.IsActive;
            postsPages.UpdatedAt = DateTime.UtcNow;

            await _postsPagesRepository.UpdateAsync(postsPages);

            // Update localizations
            await UpdateLocalizationsAsync(id, updateDto.Localizations, cancellationToken);

            // Update included post types
            await _postsPagesRepository.UpdateIncludedPostTypesAsync(
                id,
                updateDto.IncludedPostTypeIds ?? new List<int>()
            );

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var result = await GetByIdAsync(postsPages.Id, cancellationToken);
            return result;
        }
        catch (Exception ex)
        {
            return Result.Failure<PostsPagesDto>(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var postsPages = await _postsPagesRepository.GetByIdAsync(id);
            if (postsPages == null)
                return Result.Failure(MessageCodes.NotFound, "PostsPages not found");

            postsPages.IsActive = false;
            postsPages.UpdatedAt = DateTime.UtcNow;

            await _postsPagesRepository.UpdateAsync(postsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postsPages = await _postsPagesRepository.GetByIdAsync(id);
            if (postsPages == null)
                return Result.Failure(MessageCodes.NotFound, "PostsPages not found");

            postsPages.IsActive = !postsPages.IsActive;
            postsPages.UpdatedAt = DateTime.UtcNow;

            await _postsPagesRepository.UpdateAsync(postsPages);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    public async Task<Result<IEnumerable<PostsPagesDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postsPages = await _postsPagesRepository.GetAllAsync();
            var dropdownItems = postsPages
                .Where(x => x.IsActive)
                .Select(x => new PostsPagesDropdownDto { Id = x.Id, Key = x.Key, Name = x.Name })
                .OrderBy(x => x.Name)
                .ToList();

            return Result.Success<IEnumerable<PostsPagesDropdownDto>>(dropdownItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<PostsPagesDropdownDto>>(
                MessageCodes.InternalServerError,
                ex.Message
            );
        }
    }

    public async Task<Result> UpdateIncludedPostTypesAsync(
        int id,
        IEnumerable<int> postTypeIds,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postsPages = await _postsPagesRepository.GetByIdAsync(id);
            if (postsPages == null)
                return Result.Failure(MessageCodes.NotFound, "PostsPages not found");

            await _postsPagesRepository.UpdateIncludedPostTypesAsync(
                id,
                postTypeIds ?? Enumerable.Empty<int>()
            );
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.InternalServerError, ex.Message);
        }
    }

    private async Task UpdateLocalizationsAsync(
        int postsPagesId,
        List<UpdatePostsPagesLocalizedDto> localizationDtos,
        CancellationToken cancellationToken = default
    )
    {
        var existingLocalizations = await _postsPagesLocalizedRepository
            .GetQueryable()
            .Where(x => x.PostsPagesId == postsPagesId)
            .ToListAsync(cancellationToken);

        foreach (var locDto in localizationDtos ?? new List<UpdatePostsPagesLocalizedDto>())
        {
            if (locDto.Id.HasValue)
            {
                // Update existing localization
                var existing = existingLocalizations.FirstOrDefault(x => x.Id == locDto.Id.Value);
                if (existing != null)
                {
                    existing.NameLocalized = locDto.NameLocalized;
                    existing.DescriptionLocalized = locDto.DescriptionLocalized;
                    existing.LanguageId = locDto.LanguageId;
                    existing.IsActive = locDto.IsActive;
                    existing.UpdatedAt = DateTime.UtcNow;

                    await _postsPagesLocalizedRepository.UpdateAsync(existing);
                }
            }
            else
            {
                // Create new localization
                var newLocalization = new PostsPagesLocalized
                {
                    PostsPagesId = postsPagesId,
                    NameLocalized = locDto.NameLocalized,
                    DescriptionLocalized = locDto.DescriptionLocalized,
                    LanguageId = locDto.LanguageId,
                    IsActive = locDto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                await _postsPagesLocalizedRepository.AddAsync(newLocalization);
            }
        }
    }

    private static PostsPagesDto MapToDto(PostsPages postsPages)
    {
        return new PostsPagesDto
        {
            Id = postsPages.Id,
            Key = postsPages.Key,
            Name = postsPages.Name,
            Description = postsPages.Description,
            IsActive = postsPages.IsActive,
            CreatedAt = postsPages.CreatedAt,
            UpdatedAt = postsPages.UpdatedAt,
            Localizations = postsPages.Localizations
                ?.Select(l => new PostsPagesLocalizedDto
                {
                    Id = l.Id,
                    PostsPagesId = l.PostsPagesId,
                    NameLocalized = l.NameLocalized,
                    DescriptionLocalized = l.DescriptionLocalized,
                    LanguageId = l.LanguageId,
                    IsActive = l.IsActive,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                })
                .ToList() ?? new List<PostsPagesLocalizedDto>(),
            IncludedPostTypes = postsPages.IncludedPostTypes
                ?.Select(ipt => new IncludedPostTypeDto
                {
                    Id = ipt.Id,
                    PostsPagesId = ipt.PostsPagesId,
                    PostTypeId = ipt.PostTypeId,
                    PostType = new PostTypeDto
                    {
                        Id = ipt.PostType.Id,
                        Name = ipt.PostType.Name,
                        Description = ipt.PostType.Description,
                        IsActive = ipt.PostType.IsActive,
                        CreatedAt = ipt.PostType.CreatedAt,
                        UpdatedAt = ipt.PostType.UpdatedAt,
                    },
                    IsActive = ipt.IsActive,
                    CreatedAt = ipt.CreatedAt,
                    UpdatedAt = ipt.UpdatedAt,
                })
                .ToList() ?? new List<IncludedPostTypeDto>(),
        };
    }
}
