using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly IProviderLocalizedRepository _providerLocalizedRepository;
    private readonly IProviderMediaRepository _providerMediaRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IUnitOfWork _unitOfWork;

    public AdminService(
        IUserRepository userRepository,
        IProviderRepository providerRepository,
        IProviderLocalizedRepository providerLocalizedRepository,
        IProviderMediaRepository providerMediaRepository,
        ILanguageRepository languageRepository,
        IEmployeeRepository employeeRepository,
        IRoleRepository roleRepository,
        IUserRoleRepository userRoleRepository,
        IPermissionRepository permissionRepository,
        IAuthenticationService authenticationService,
        IUnitOfWork unitOfWork
    )
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _providerRepository =
            providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _providerLocalizedRepository =
            providerLocalizedRepository
            ?? throw new ArgumentNullException(nameof(providerLocalizedRepository));
        _providerMediaRepository =
            providerMediaRepository
            ?? throw new ArgumentNullException(nameof(providerMediaRepository));
        _languageRepository =
            languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _employeeRepository =
            employeeRepository ?? throw new ArgumentNullException(nameof(employeeRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        _userRoleRepository =
            userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _permissionRepository =
            permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
        _authenticationService =
            authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<AuthResponseDto>> LoginAdminAsync(
        LoginDto loginDto,
        CancellationToken cancellationToken = default
    )
    {
        return await _authenticationService.LoginEmployeeAsync(loginDto, cancellationToken);
    }

    public async Task<Result<PaginatedResult<UserDto>>> GetAllUsersAsync(
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default
    )
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<UserDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<UserDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        // Use existing provider service pattern
        return Result.Failure<PaginatedResult<UserDto>>(MessageCodes.NOT_IMPLEMENTED);
    }

    public async Task<Result<UserDto?>> GetUserByIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        if (userId <= 0)
            return Result.Failure<UserDto?>(MessageCodes.INVALID_ID);

        var result = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<UserDto?>(result.MessageCode);

        if (result.Value == null)
            return Result.Success<UserDto?>(null);

        var userDto = new UserDto
        {
            Id = result.Value.Id,
            Email = result.Value.Email,
            PhoneNumber = result.Value.PhoneNumber,
            // LocationId = result.Value.LocationId,
            IsActive = result.Value.IsActive,
            CreatedAt = result.Value.CreatedAt,
            UpdatedAt = result.Value.UpdatedAt,
        };

        return Result.Success<UserDto?>(userDto);
    }

    public async Task<Result> AssignRoleToUserAsync(
        int userId,
        int roleId,
        CancellationToken cancellationToken = default
    )
    {
        // Simplified implementation - return not implemented for now
        return Result.Failure(MessageCodes.NOT_IMPLEMENTED);
    }

    public async Task<Result> RemoveRoleFromUserAsync(
        int userId,
        int roleId,
        CancellationToken cancellationToken = default
    )
    {
        // Simplified implementation - return not implemented for now
        return Result.Failure(MessageCodes.NOT_IMPLEMENTED);
    }

    public async Task<Result<IEnumerable<RoleDto>>> GetUserRolesAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        // Simplified implementation - return not implemented for now
        return Result.Failure<IEnumerable<RoleDto>>(MessageCodes.NOT_IMPLEMENTED);
    }

    public async Task<Result<IEnumerable<PermissionDto>>> GetUserPermissionsAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        // Simplified implementation - return not implemented for now
        return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.NOT_IMPLEMENTED);
    }

    public async Task<Result> ToggleUserActivationAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        if (userId <= 0)
            return Result.Failure(MessageCodes.INVALID_ID);

        var result = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (result.IsFailure)
            return result;

        if (result.Value == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        result.Value.IsActive = !result.Value.IsActive;
        result.Value.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(result.Value);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> SoftDeleteUserAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        if (userId <= 0)
            return Result.Failure(MessageCodes.INVALID_ID);

        var result = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (result.IsFailure)
            return result;

        if (result.Value == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        result.Value.IsDeleted = true;
        result.Value.DeletedAt = DateTime.UtcNow;
        result.Value.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(result.Value);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<ProviderDto>> CreateProviderAsync(
        CreateProviderByAdminDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input
        var validationResult = ValidateCreateProviderByAdminDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProviderDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.GetByEmailAsync(
            createDto.Email,
            cancellationToken
        );
        if (emailExistsResult.IsFailure)
            return Result.Failure<ProviderDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value != null)
            return Result.Failure<ProviderDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Check if phone number already exists (if provided)
        if (!string.IsNullOrWhiteSpace(createDto.PhoneNumber))
        {
            var phoneExistsResult = await _userRepository.GetByPhoneNumberAsync(
                createDto.PhoneNumber,
                cancellationToken
            );
            if (phoneExistsResult.IsFailure)
                return Result.Failure<ProviderDto>(phoneExistsResult.MessageCode);

            if (phoneExistsResult.Value != null)
                return Result.Failure<ProviderDto>(MessageCodes.USER_PHONE_NUMBER_ALREADY_EXISTS);
        }

        // Validate parent provider if specified
        if (createDto.ParentId.HasValue)
        {
            var parentResult = await _providerRepository.GetByIdAsync(
                createDto.ParentId.Value,
                cancellationToken
            );
            if (parentResult.IsFailure)
                return Result.Failure<ProviderDto>(parentResult.MessageCode);

            if (parentResult.Value == null)
                return Result.Failure<ProviderDto>(MessageCodes.ENTITY_NOT_FOUND);
        }

        // Validate languages for localizations
        foreach (var localization in createDto.Localizations)
        {
            var languageResult = await _languageRepository.GetByIdAsync(
                localization.LanguageId,
                cancellationToken
            );
            if (languageResult.IsFailure)
                return Result.Failure<ProviderDto>(languageResult.MessageCode);

            if (languageResult.Value == null)
                return Result.Failure<ProviderDto>(MessageCodes.LANGUAGE_NOT_FOUND);
        }

        // Create User entity
        var user = new User
        {
            Email = createDto.Email,
            PhoneNumber = createDto.PhoneNumber,
            // LocationId = createDto.LocationId,
            IsActive = createDto.IsActive,
        };

        var userCreateResult = await _userRepository.AddAsync(user, cancellationToken);
        if (userCreateResult.IsFailure)
            return Result.Failure<ProviderDto>(userCreateResult.MessageCode);

        // Save to get the user ID
        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProviderDto>(saveResult.MessageCode);

        // Create Provider entity
        var provider = new Provider
        {
            UserId = user.Id,
            BusinessName = createDto.BusinessName,
            Description = createDto.Description,
            Rating = createDto.Rating,
            ParentId = createDto.ParentId,
            User = user,
            ProviderMedias = createDto
                .Images.Select(image => new ProviderMedia
                {
                    Url = image.Url,
                    MediaType = MediaType.Image,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                })
                .ToList(),
        };

        var providerCreateResult = await _providerRepository.AddAsync(provider, cancellationToken);
        if (providerCreateResult.IsFailure)
            return Result.Failure<ProviderDto>(providerCreateResult.MessageCode);

        // Create localizations
        var providerLocalizations = new List<ProviderLocalized>();
        foreach (var localizationDto in createDto.Localizations)
        {
            var localization = new ProviderLocalized
            {
                ProviderId = user.Id, // Provider ID is same as User ID
                LanguageId = localizationDto.LanguageId,
                BusinessNameLocalized = localizationDto.BusinessNameLocalized,
                DescriptionLocalized = localizationDto.DescriptionLocalized,
                Provider = provider,
            };

            var localizationCreateResult = await _providerLocalizedRepository.AddAsync(
                localization,
                cancellationToken
            );
            if (localizationCreateResult.IsFailure)
                return Result.Failure<ProviderDto>(localizationCreateResult.MessageCode);

            providerLocalizations.Add(localization);
        }

        provider.ProviderLocalizeds = providerLocalizations;

        // Save all changes
        var finalSaveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (finalSaveResult.IsFailure)
            return Result.Failure<ProviderDto>(finalSaveResult.MessageCode);

        // Map to DTO and return
        var providerDto = await MapProviderToDtoAsync(provider, cancellationToken);
        return Result.Success(providerDto);
    }

    private static Result ValidateCreateProviderByAdminDto(CreateProviderByAdminDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (!IsValidEmail(dto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        if (string.IsNullOrWhiteSpace(dto.BusinessName))
            return Result.Failure(MessageCodes.FIELD_REQUIRED);

        if (string.IsNullOrWhiteSpace(dto.Description))
            return Result.Failure(MessageCodes.FIELD_REQUIRED);

        if (dto.Rating < 1 || dto.Rating > 5)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        return Result.Success();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private async Task<ProviderDto> MapProviderToDtoAsync(
        Provider provider,
        CancellationToken cancellationToken
    )
    {
        // Create basic DTO - localizations will be empty for now to avoid repository method issues
        var localizationDtos = new List<ProviderLocalizedDto>();

        // Try to get localizations if the method exists
        try
        {
            foreach (var localization in provider.ProviderLocalizeds)
            {
                var languageResult = await _languageRepository.GetByIdAsync(
                    localization.LanguageId,
                    cancellationToken
                );
                var language = languageResult.IsSuccess ? languageResult.Value : null;

                localizationDtos.Add(
                    new ProviderLocalizedDto
                    {
                        Id = localization.Id,
                        ProviderId = localization.ProviderId,
                        LanguageId = localization.LanguageId,
                        LanguageCode = language?.Code ?? string.Empty,
                        LanguageName = language?.Name ?? string.Empty,
                        BusinessNameLocalized = localization.BusinessNameLocalized,
                        DescriptionLocalized = localization.DescriptionLocalized,
                        IsActive = localization.IsActive,
                        CreatedAt = localization.CreatedAt,
                        UpdatedAt = localization.UpdatedAt,
                    }
                );
            }
        }
        catch
        {
            // If there's an issue with localizations, continue with empty list
        }

        // Get parent provider name if exists
        string? parentBusinessName = null;
        if (provider.ParentId.HasValue)
        {
            try
            {
                var parentResult = await _providerRepository.GetByIdAsync(
                    provider.ParentId.Value,
                    cancellationToken
                );
                if (parentResult.IsSuccess && parentResult.Value != null)
                {
                    parentBusinessName = parentResult.Value.BusinessName;
                }
            }
            catch
            {
                // If there's an issue, continue with null parent name
            }
        }

        return new ProviderDto
        {
            UserId = provider.UserId,
            PhoneNumber = provider.User?.PhoneNumber,
            BusinessName = provider.BusinessName,
            Description = provider.Description,
            Rating = provider.Rating,
            ParentId = provider.ParentId,
            ParentBusinessName = parentBusinessName,
            IsActive = provider.User?.IsActive ?? true,
            CreatedAt = provider.User?.CreatedAt ?? DateTime.UtcNow,
            UpdatedAt = provider.User?.UpdatedAt ?? DateTime.UtcNow,
            Localizations = localizationDtos,
        };
    }

    public async Task<Result<PaginatedResult<ProviderDto>>> GetAllProvidersAsync(
        int page = 1,
        int pageSize = 10,
        bool? activeOnly = null,
        int? parentId = null,
        CancellationToken cancellationToken = default
    )
    {
        var providersResult = await _providerRepository.GetPaginatedWithUserAsync(
            page,
            pageSize,
            activeOnly,
            parentId,
            cancellationToken
        );

        if (providersResult.IsFailure)
            return Result.Failure<PaginatedResult<ProviderDto>>(providersResult.MessageCode);

        var providerDtos = new List<ProviderDto>();

        foreach (var provider in providersResult.Value.Items)
        {
            var providerDto = await MapProviderToDtoWithMediaAsync(provider, cancellationToken);
            providerDtos.Add(providerDto);
        }

        var paginatedResult = new PaginatedResult<ProviderDto>(
            providerDtos,
            providersResult.Value.TotalCount,
            providersResult.Value.Page,
            providersResult.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<ProviderDto>> UpdateProviderAsync(
        int id,
        UpdateProviderByAdminDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (id <= 0)
            return Result.Failure<ProviderDto>(MessageCodes.INVALID_ID);

        // Validate input
        var validationResult = ValidateUpdateProviderByAdminDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProviderDto>(validationResult.MessageCode);

        // Get existing provider
        var providerResult = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (providerResult.IsFailure)
            return Result.Failure<ProviderDto>(providerResult.MessageCode);

        if (providerResult.Value == null)
            return Result.Failure<ProviderDto>(MessageCodes.ENTITY_NOT_FOUND);

        var provider = providerResult.Value;

        // Get existing user
        var userResult = await _userRepository.GetByIdAsync(provider.UserId, cancellationToken);
        if (userResult.IsFailure)
            return Result.Failure<ProviderDto>(userResult.MessageCode);

        if (userResult.Value == null)
            return Result.Failure<ProviderDto>(MessageCodes.USER_NOT_FOUND);

        var user = userResult.Value;

        // Check if email already exists (excluding current user)
        if (!string.Equals(user.Email, updateDto.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailExistsResult = await _userRepository.GetByEmailAsync(
                updateDto.Email,
                cancellationToken
            );
            if (emailExistsResult.IsFailure)
                return Result.Failure<ProviderDto>(emailExistsResult.MessageCode);

            if (emailExistsResult.Value != null && emailExistsResult.Value.Id != user.Id)
                return Result.Failure<ProviderDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);
        }

        // Check if phone number already exists (excluding current user, if provided)
        if (
            !string.IsNullOrWhiteSpace(updateDto.PhoneNumber)
            && !string.Equals(
                user.PhoneNumber,
                updateDto.PhoneNumber,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            var phoneExistsResult = await _userRepository.GetByPhoneNumberAsync(
                updateDto.PhoneNumber,
                cancellationToken
            );
            if (phoneExistsResult.IsFailure)
                return Result.Failure<ProviderDto>(phoneExistsResult.MessageCode);

            if (phoneExistsResult.Value != null && phoneExistsResult.Value.Id != user.Id)
                return Result.Failure<ProviderDto>(MessageCodes.USER_PHONE_NUMBER_ALREADY_EXISTS);
        }

        // Validate parent provider if specified
        if (updateDto.ParentId.HasValue && updateDto.ParentId != provider.ParentId)
        {
            var parentResult = await _providerRepository.GetByIdAsync(
                updateDto.ParentId.Value,
                cancellationToken
            );
            if (parentResult.IsFailure)
                return Result.Failure<ProviderDto>(parentResult.MessageCode);

            if (parentResult.Value == null)
                return Result.Failure<ProviderDto>(MessageCodes.ENTITY_NOT_FOUND);

            // Prevent self-reference
            if (updateDto.ParentId.Value == id)
                return Result.Failure<ProviderDto>(MessageCodes.INVALID_INPUT);
        }

        // Validate languages for localizations
        foreach (var localization in updateDto.Localizations)
        {
            var languageResult = await _languageRepository.GetByIdAsync(
                localization.LanguageId,
                cancellationToken
            );
            if (languageResult.IsFailure)
                return Result.Failure<ProviderDto>(languageResult.MessageCode);

            if (languageResult.Value == null)
                return Result.Failure<ProviderDto>(MessageCodes.LANGUAGE_NOT_FOUND);
        }

        // Update user entity
        user.Email = updateDto.Email;
        user.PhoneNumber = updateDto.PhoneNumber;
        // user.LocationId = updateDto.LocationId;
        user.IsActive = updateDto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        var userUpdateResult = _userRepository.Update(user);
        if (userUpdateResult.IsFailure)
            return Result.Failure<ProviderDto>(userUpdateResult.MessageCode);

        // Update provider entity
        provider.BusinessName = updateDto.BusinessName;
        provider.Description = updateDto.Description;
        provider.Rating = updateDto.Rating;
        provider.ParentId = updateDto.ParentId;

        _providerRepository.Update(provider);

        // Update provider media
        if (updateDto.Images.Any())
        {
            // Remove existing media
            var existingMediaResult = await _providerMediaRepository.GetByProviderIdAsync(
                provider.UserId,
                null,
                cancellationToken
            );
            if (existingMediaResult.IsSuccess && existingMediaResult.Value != null)
            {
                foreach (var media in existingMediaResult.Value)
                {
                    media.IsDeleted = true;
                    media.DeletedAt = DateTime.UtcNow;
                    media.UpdatedAt = DateTime.UtcNow;
                    _providerMediaRepository.Update(media);
                }
            }

            // Add new media
            foreach (var imageDto in updateDto.Images)
            {
                var newMedia = new ProviderMedia
                {
                    ProviderId = provider.UserId,
                    Url = imageDto.Url,
                    MediaType = MediaType.Image,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                var mediaCreateResult = await _providerMediaRepository.AddAsync(
                    newMedia,
                    cancellationToken
                );
                if (mediaCreateResult.IsFailure)
                    return Result.Failure<ProviderDto>(mediaCreateResult.MessageCode);
            }
        }

        // Update localizations - Get existing localizations
        var existingLocalizationsResult = await _providerLocalizedRepository.GetAllAsync(
            cancellationToken
        );
        var existingLocalizations =
            existingLocalizationsResult.IsSuccess && existingLocalizationsResult.Value != null
                ? existingLocalizationsResult
                    .Value.Where(pl => pl.ProviderId == provider.UserId && !pl.IsDeleted)
                    .ToList()
                : new List<ProviderLocalized>();

        // Track which existing localizations have been updated
        var updatedLanguageIds = new HashSet<int>();

        // Update or insert localizations
        foreach (var localizationDto in updateDto.Localizations)
        {
            // Find existing localization for this language
            var existingLocalization = existingLocalizations
                .FirstOrDefault(el => el.LanguageId == localizationDto.LanguageId);

            if (existingLocalization != null)
            {
                // Update existing localization
                existingLocalization.BusinessNameLocalized = localizationDto.BusinessNameLocalized;
                existingLocalization.DescriptionLocalized = localizationDto.DescriptionLocalized;
                existingLocalization.IsActive = localizationDto.IsActive;
                existingLocalization.UpdatedAt = DateTime.UtcNow;
                
                _providerLocalizedRepository.Update(existingLocalization);
                updatedLanguageIds.Add(localizationDto.LanguageId);
            }
            else
            {
                // Insert new localization
                var newLocalization = new ProviderLocalized
                {
                    ProviderId = provider.UserId,
                    LanguageId = localizationDto.LanguageId,
                    BusinessNameLocalized = localizationDto.BusinessNameLocalized,
                    DescriptionLocalized = localizationDto.DescriptionLocalized,
                    IsActive = localizationDto.IsActive,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                var localizationCreateResult = await _providerLocalizedRepository.AddAsync(
                    newLocalization,
                    cancellationToken
                );
                if (localizationCreateResult.IsFailure)
                    return Result.Failure<ProviderDto>(localizationCreateResult.MessageCode);
                
                updatedLanguageIds.Add(localizationDto.LanguageId);
            }
        }

        // Mark any remaining existing localizations as deleted (those not in the update)
        foreach (var existingLoc in existingLocalizations)
        {
            if (!updatedLanguageIds.Contains(existingLoc.LanguageId))
            {
                existingLoc.IsDeleted = true;
                existingLoc.DeletedAt = DateTime.UtcNow;
                existingLoc.UpdatedAt = DateTime.UtcNow;
                _providerLocalizedRepository.Update(existingLoc);
            }
        }

        // Save all changes
        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProviderDto>(saveResult.MessageCode);

        // Map to DTO and return
        var updatedProvider = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (updatedProvider.IsSuccess && updatedProvider.Value != null)
        {
            var providerDto = await MapProviderToDtoWithMediaAsync(
                updatedProvider.Value,
                cancellationToken
            );
            return Result.Success(providerDto);
        }

        return Result.Failure<ProviderDto>(MessageCodes.ENTITY_NOT_FOUND);
    }

    private static Result ValidateUpdateProviderByAdminDto(UpdateProviderByAdminDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (!IsValidEmail(dto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        if (string.IsNullOrWhiteSpace(dto.BusinessName))
            return Result.Failure(MessageCodes.FIELD_REQUIRED);

        if (string.IsNullOrWhiteSpace(dto.Description))
            return Result.Failure(MessageCodes.FIELD_REQUIRED);

        if (dto.Rating < 1 || dto.Rating > 5)
            return Result.Failure(MessageCodes.INVALID_INPUT);

        return Result.Success();
    }

    private async Task<ProviderDto> MapProviderToDtoWithMediaAsync(
        Provider provider,
        CancellationToken cancellationToken
    )
    {
        // Get basic provider DTO
        var baseDto = await MapProviderToDtoAsync(provider, cancellationToken);

        if (provider.ProviderMedias.Count > 0)
        {
            baseDto.Images = provider
                .ProviderMedias.Select(media => new ImageUrlDto { Url = media.Url })
                .ToList();
        }

        return baseDto;
    }
}
