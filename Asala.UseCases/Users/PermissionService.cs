using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PermissionService(IPermissionRepository permissionRepository, IUnitOfWork unitOfWork)
    {
        _permissionRepository = permissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<PermissionDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionRepository.GetPaginatedWithLocalizationsAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<PermissionDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<PermissionDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<PermissionDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PermissionDto?>(idValidationResult.MessageCode);

        var result = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<PermissionDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<PermissionDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<PermissionDto?>(MessageCodes.PERMISSION_NAME_REQUIRED);

        var result = await _permissionRepository.GetByNameAsync(name, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<PermissionDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<PermissionDto>> CreateAsync(
        CreatePermissionDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreatePermissionDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<PermissionDto>(validationResult.MessageCode);

        // Check if name already exists
        var nameExistsResult = await _permissionRepository.ExistsByNameAsync(
            createDto.Name,
            cancellationToken: cancellationToken
        );
        if (nameExistsResult.IsFailure)
            return Result.Failure<PermissionDto>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<PermissionDto>(MessageCodes.PERMISSION_NAME_ALREADY_EXISTS);

        var permission = new Permission
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Localizations = CreateLocalizations(createDto.Localizations),
        };

        var addResult = await _permissionRepository.AddAsync(permission, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<PermissionDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PermissionDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<PermissionDto?>> UpdateAsync(
        int id,
        UpdatePermissionDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PermissionDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdatePermissionDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<PermissionDto?>(validationResult.MessageCode);

        // Check if name already exists (excluding current permission)
        var nameExistsResult = await _permissionRepository.ExistsByNameAsync(
            updateDto.Name,
            id,
            cancellationToken
        );
        if (nameExistsResult.IsFailure)
            return Result.Failure<PermissionDto?>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<PermissionDto?>(MessageCodes.PERMISSION_NAME_ALREADY_EXISTS);

        var getResult = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<PermissionDto?>(getResult.MessageCode);

        var permission = getResult.Value;
        if (permission == null)
            return Result.Success<PermissionDto?>(null);

        permission.Name = updateDto.Name.Trim();
        permission.Description = updateDto.Description.Trim();
        permission.IsActive = updateDto.IsActive;
        permission.UpdatedAt = DateTime.UtcNow;

        // Handle localizations
        UpdateLocalizations(permission, updateDto.Localizations);

        var updateResult = _permissionRepository.Update(permission);
        if (updateResult.IsFailure)
            return Result.Failure<PermissionDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<PermissionDto?>(saveResult.MessageCode);

        var dto = MapToDto(permission);
        return Result.Success<PermissionDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var permission = getResult.Value;
        if (permission == null)
            return Result.Failure(MessageCodes.PERMISSION_NOT_FOUND);

        // Soft delete permission and all localizations
        permission.IsDeleted = true;
        permission.DeletedAt = DateTime.UtcNow;
        permission.UpdatedAt = DateTime.UtcNow;

        foreach (var localization in permission.Localizations)
        {
            localization.IsDeleted = true;
            localization.DeletedAt = DateTime.UtcNow;
            localization.UpdatedAt = DateTime.UtcNow;
        }

        var updateResult = _permissionRepository.Update(permission);
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

        var getResult = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var permission = getResult.Value;
        if (permission == null)
            return Result.Failure(MessageCodes.PERMISSION_NOT_FOUND);

        permission.IsActive = !permission.IsActive;
        permission.UpdatedAt = DateTime.UtcNow;

        var updateResult = _permissionRepository.Update(permission);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<PermissionDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Permission, bool>> filter = BuildFilter(activeOnly);

        var result = await _permissionRepository.GetAsync(
            filter: filter,
            orderBy: q => q.OrderBy(p => p.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<PermissionDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<PermissionDropdownDto>>(dtos);
    }

    public async Task<Result<IEnumerable<int>>> GetPermissionsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await _permissionRepository.GetPermissionsMissingTranslationsAsync(cancellationToken);
    }

    #region Private Helper Methods

    private static Expression<Func<Permission, bool>> BuildFilter(bool activeOnly)
    {
        return p => !p.IsDeleted && (!activeOnly || p.IsActive);
    }

    private static List<PermissionLocalized> CreateLocalizations(
        List<CreatePermissionLocalizedDto> localizationDtos
    )
    {
        return localizationDtos
            .Select(dto => new PermissionLocalized
            {
                Name = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                LanguageId = dto.LanguageId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();
    }

    private static void UpdateLocalizations(
        Permission permission,
        List<UpdatePermissionLocalizedDto> localizationDtos
    )
    {
        var now = DateTime.UtcNow;

        // Handle existing localizations
        foreach (var existingLocalization in permission.Localizations)
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
            .Where(dto => dto.Id == 0)
            .Select(dto => new PermissionLocalized
            {
                Name = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                LanguageId = dto.LanguageId,
                CreatedAt = now,
                UpdatedAt = now,
            });

        foreach (var newLocalization in newLocalizations)
        {
            permission.Localizations.Add(newLocalization);
        }
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.PERMISSION_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreatePermissionDto(CreatePermissionDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.PERMISSION_NAME_REQUIRED);

        if (createDto.Name.Length > 100)
            return Result.Failure(MessageCodes.PERMISSION_NAME_TOO_LONG);

        if (createDto.Description.Length > 500)
            return Result.Failure(MessageCodes.PERMISSION_DESCRIPTION_TOO_LONG);

        var localizationValidation = ValidateCreateLocalizations(createDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateUpdatePermissionDto(UpdatePermissionDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.PERMISSION_NAME_REQUIRED);

        if (updateDto.Name.Length > 100)
            return Result.Failure(MessageCodes.PERMISSION_NAME_TOO_LONG);

        if (updateDto.Description.Length > 500)
            return Result.Failure(MessageCodes.PERMISSION_DESCRIPTION_TOO_LONG);

        var localizationValidation = ValidateUpdateLocalizations(updateDto.Localizations);
        if (localizationValidation.IsFailure)
            return localizationValidation;

        return Result.Success();
    }

    private static Result ValidateCreateLocalizations(List<CreatePermissionLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_NAME_REQUIRED);

            if (localization.Name.Length > 100)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_NAME_TOO_LONG);

            if (localization.Description.Length > 500)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    private static Result ValidateUpdateLocalizations(List<UpdatePermissionLocalizedDto> localizations)
    {
        if (localizations == null)
            return Result.Success(); // Optional localizations

        foreach (var localization in localizations)
        {
            if (string.IsNullOrWhiteSpace(localization.Name))
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_NAME_REQUIRED);

            if (localization.Name.Length > 100)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_NAME_TOO_LONG);

            if (localization.Description.Length > 500)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_DESCRIPTION_TOO_LONG);

            if (localization.LanguageId <= 0)
                return Result.Failure(MessageCodes.PERMISSION_LOCALIZED_LANGUAGE_ID_INVALID);
        }

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static PermissionDto MapToDto(Permission permission)
    {
        return new PermissionDto
        {
            Id = permission.Id,
            Name = permission.Name,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt,
            Localizations =
            [
                .. permission.Localizations.Where(l => !l.IsDeleted).Select(MapLocalizationToDto),
            ],
        };
    }

    private static PermissionLocalizedDto MapLocalizationToDto(PermissionLocalized localization)
    {
        return new PermissionLocalizedDto
        {
            Id = localization.Id,
            PermissionId = localization.PermissionId,
            Name = localization.Name,
            Description = localization.Description,
            LanguageId = localization.LanguageId,
            CreatedAt = localization.CreatedAt,
            UpdatedAt = localization.UpdatedAt,
            Language =
                localization.Language != null
                    ? new LanguageDto
                    {
                        Id = localization.Language.Id,
                        Code = localization.Language.Code,
                        Name = localization.Language.Name,
                    }
                    : null,
        };
    }

    private static PermissionDropdownDto MapToDropdownDto(Permission permission)
    {
        return new PermissionDropdownDto { Id = permission.Id, Name = permission.Name };
    }

    #endregion
}
