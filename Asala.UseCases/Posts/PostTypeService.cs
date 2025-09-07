using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Posts.DTOs;
using Asala.Core.Modules.Posts.Models;

namespace Asala.UseCases.Posts;

public class PostTypeService : IPostTypeService
{
    private readonly IPostTypeRepository _postTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PostTypeService(IPostTypeRepository postTypeRepository, IUnitOfWork unitOfWork)
    {
        _postTypeRepository = postTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<PostTypeDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<PostTypeDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<PostTypeDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<PostTypeDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PostTypeDto?>(idValidationResult.MessageCode);

        var postTypeResult = await _postTypeRepository.GetByIdWithLocalizationsAsync(
            id,
            cancellationToken
        );
        if (postTypeResult.IsFailure)
            return Result.Failure<PostTypeDto?>(postTypeResult.MessageCode);

        if (postTypeResult.Value == null || postTypeResult.Value.IsDeleted)
            return Result.Failure<PostTypeDto?>(MessageCodes.POSTTYPE_NOT_FOUND);

        var postTypeDto = MapToDto(postTypeResult.Value);
        return Result.Success<PostTypeDto?>(postTypeDto);
    }

    public async Task<Result<PostTypeDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<PostTypeDto?>(MessageCodes.POSTTYPE_NAME_REQUIRED);

        var result = await _postTypeRepository.GetByNameWithLocalizationsAsync(
            name,
            cancellationToken
        );
        if (result.IsFailure)
            return Result.Failure<PostTypeDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<PostTypeDto>> CreateAsync(
        CreatePostTypeDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreatePostTypeDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<PostTypeDto>(validationResult.MessageCode);

        // Check if post type name already exists
        var existsResult = await _postTypeRepository.ExistsByNameAsync(
            createDto.Name,
            cancellationToken: cancellationToken
        );
        if (existsResult.IsFailure)
            return Result.Failure<PostTypeDto>(existsResult.MessageCode);

        if (existsResult.Value)
            return Result.Failure<PostTypeDto>(MessageCodes.POSTTYPE_NAME_ALREADY_EXISTS);

        var postType = new PostType
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PostTypeLocalizations = CreateLocalizations(createDto.Localizations),
        };

        var addResult = await _postTypeRepository.AddAsync(postType, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<PostTypeDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostTypeDto>(saveResult.MessageCode);

        // Get the created post type with its localizations
        var createdPostTypeResult = await _postTypeRepository.GetByIdWithLocalizationsAsync(
            addResult.Value.Id,
            cancellationToken
        );

        if (createdPostTypeResult.IsFailure || createdPostTypeResult.Value == null)
            return Result.Failure<PostTypeDto>(MessageCodes.POSTTYPE_NOT_FOUND);

        var dto = MapToDto(createdPostTypeResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<PostTypeDto?>> UpdateAsync(
        int id,
        UpdatePostTypeDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PostTypeDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdatePostTypeDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<PostTypeDto?>(validationResult.MessageCode);

        // Get existing post type
        var getResult = await _postTypeRepository.GetByIdWithLocalizationsAsync(
            id,
            cancellationToken
        );
        if (getResult.IsFailure)
            return Result.Failure<PostTypeDto?>(getResult.MessageCode);

        var postType = getResult.Value;
        if (postType == null)
            return Result.Success<PostTypeDto?>(null);

        // Check if name is being changed and if new name already exists
        if (postType.Name != updateDto.Name.Trim())
        {
            var existsResult = await _postTypeRepository.ExistsByNameAsync(
                updateDto.Name.Trim(),
                excludeId: id,
                cancellationToken
            );

            if (existsResult.IsFailure)
                return Result.Failure<PostTypeDto?>(existsResult.MessageCode);

            if (existsResult.Value)
                return Result.Failure<PostTypeDto?>(MessageCodes.POSTTYPE_NAME_ALREADY_EXISTS);
        }

        // Update post type properties
        postType.Name = updateDto.Name.Trim();
        postType.Description = updateDto.Description.Trim();
        postType.IsActive = updateDto.IsActive;
        postType.UpdatedAt = DateTime.UtcNow;

        // Handle localizations
        UpdateLocalizations(postType, updateDto.Localizations);

        var updateResult = _postTypeRepository.Update(postType);
        if (updateResult.IsFailure)
            return Result.Failure<PostTypeDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PostTypeDto?>(saveResult.MessageCode);

        var dto = MapToDto(postType);
        return Result.Success<PostTypeDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _postTypeRepository.GetByIdWithLocalizationsAsync(
            id,
            cancellationToken
        );
        if (getResult.IsFailure)
            return getResult;

        var postType = getResult.Value;
        if (postType == null)
            return Result.Failure(MessageCodes.POSTTYPE_NOT_FOUND);

        // Soft delete post type and all localizations
        postType.IsDeleted = true;
        postType.DeletedAt = DateTime.UtcNow;
        postType.UpdatedAt = DateTime.UtcNow;

        foreach (var localization in postType.PostTypeLocalizations)
        {
            localization.IsDeleted = true;
            localization.DeletedAt = DateTime.UtcNow;
            localization.UpdatedAt = DateTime.UtcNow;
        }

        var updateResult = _postTypeRepository.Update(postType);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _postTypeRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var postType = getResult.Value;
        if (postType == null)
            return Result.Failure(MessageCodes.POSTTYPE_NOT_FOUND);

        postType.IsActive = !postType.IsActive;
        postType.UpdatedAt = DateTime.UtcNow;

        var updateResult = _postTypeRepository.Update(postType);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<int>>> GetPostTypesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await _postTypeRepository.GetPostTypesMissingTranslationsAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<PostTypeDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeRepository.GetAsync(
            filter: pt => !pt.IsDeleted && pt.IsActive,
            orderBy: query => query.OrderBy(pt => pt.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<PostTypeDropdownDto>>(result.MessageCode);

        var dropdownItems = result
            .Value.Select(pt => new PostTypeDropdownDto
            {
                Id = pt.Id,
                Name = pt.Name,
                Description = pt.Description,
            })
            .ToList();

        return Result.Success<IEnumerable<PostTypeDropdownDto>>(dropdownItems);
    }

    #region Private Helper Methods

    private static List<PostTypeLocalized> CreateLocalizations(
        List<CreatePostTypeLocalizedDto> localizationDtos
    )
    {
        return localizationDtos
            .Select(dto => new PostTypeLocalized
            {
                Name = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                LanguageId = dto.LanguageId,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();
    }

    private static void UpdateLocalizations(
        PostType postType,
        List<UpdatePostTypeLocalizedDto> localizationDtos
    )
    {
        var now = DateTime.UtcNow;

        // Handle existing localizations
        foreach (var existingLocalization in postType.PostTypeLocalizations)
        {
            var updatedDto = localizationDtos.FirstOrDefault(dto =>
                dto.Id == existingLocalization.Id
            );
            if (updatedDto != null)
            {
                // Update existing localization
                existingLocalization.Name = updatedDto.Name.Trim();
                existingLocalization.Description = updatedDto.Description.Trim();
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
            .Select(dto => new PostTypeLocalized
            {
                Name = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                LanguageId = dto.LanguageId,
                IsActive = dto.IsActive,
                CreatedAt = now,
                UpdatedAt = now,
            });

        foreach (var newLocalization in newLocalizations)
        {
            postType.PostTypeLocalizations.Add(newLocalization);
        }
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.POSTTYPE_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreatePostTypeDto(CreatePostTypeDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.POSTTYPE_NAME_REQUIRED);

        if (createDto.Name.Length > 200)
            return Result.Failure(MessageCodes.POSTTYPE_NAME_TOO_LONG);

        // Validate Description
        if (string.IsNullOrWhiteSpace(createDto.Description))
            return Result.Failure(MessageCodes.POSTTYPE_DESCRIPTION_REQUIRED);

        if (createDto.Description.Length > 2000)
            return Result.Failure(MessageCodes.POSTTYPE_DESCRIPTION_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateLocalizations(createDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateUpdatePostTypeDto(UpdatePostTypeDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Same validations as Create
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.POSTTYPE_NAME_REQUIRED);

        if (updateDto.Name.Length > 200)
            return Result.Failure(MessageCodes.POSTTYPE_NAME_TOO_LONG);

        if (string.IsNullOrWhiteSpace(updateDto.Description))
            return Result.Failure(MessageCodes.POSTTYPE_DESCRIPTION_REQUIRED);

        if (updateDto.Description.Length > 2000)
            return Result.Failure(MessageCodes.POSTTYPE_DESCRIPTION_TOO_LONG);

        // Validate localizations
        var localizationValidation = ValidateUpdateLocalizations(updateDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateLocalizations(List<CreatePostTypeLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_NAME_REQUIRED);

            if (string.IsNullOrWhiteSpace(localization.Description))
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_DESCRIPTION_REQUIRED);

            if (localization.Name.Length > 200)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_NAME_TOO_LONG);

            if (localization.Description.Length > 2000)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    private static Result ValidateUpdateLocalizations(
        List<UpdatePostTypeLocalizedDto> localizations
    )
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_NAME_REQUIRED);

            if (string.IsNullOrWhiteSpace(localization.Description))
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_DESCRIPTION_REQUIRED);

            if (localization.Name.Length > 200)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_NAME_TOO_LONG);

            if (localization.Description.Length > 2000)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.POSTTYPE_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static PostTypeDto MapToDto(PostType postType)
    {
        return new PostTypeDto
        {
            Id = postType.Id,
            Name = postType.Name,
            Description = postType.Description,
            IsActive = postType.IsActive,
            CreatedAt = postType.CreatedAt,
            UpdatedAt = postType.UpdatedAt,
            Localizations = postType
                .PostTypeLocalizations.Where(l => !l.IsDeleted)
                .Select(MapLocalizationToDto)
                .ToList(),
        };
    }

    private static PostTypeLocalizedDto MapLocalizationToDto(PostTypeLocalized localization)
    {
        return new PostTypeLocalizedDto
        {
            Id = localization.Id,
            Name = localization.Name,
            Description = localization.Description,
            LanguageId = localization.LanguageId,
            LanguageName = localization.Language?.Name ?? string.Empty,
            LanguageCode = localization.Language?.Code ?? string.Empty,
            IsActive = localization.IsActive,
            CreatedAt = localization.CreatedAt,
            UpdatedAt = localization.UpdatedAt,
        };
    }

    #endregion
}
