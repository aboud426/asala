using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Db;

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
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Permission, bool>> filter = BuildFilter(activeOnly);

        var result = await _permissionRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(p => p.Name)
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

    public async Task<Result<PermissionDto>> CreateAsync(
        CreatePermissionDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var validationResult = ValidateCreatePermissionDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<PermissionDto>(validationResult.MessageCode);

        var permission = new Permission
        {
            Name = createDto.Name.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
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
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<PermissionDto?>(idValidationResult.MessageCode);

        var validationResult = ValidateUpdatePermissionDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<PermissionDto?>(validationResult.MessageCode);

        var getResult = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<PermissionDto?>(getResult.MessageCode);

        var permission = getResult.Value;
        if (permission == null)
            return Result.Success<PermissionDto?>(null);

        permission.Name = updateDto.Name.Trim();
        permission.IsActive = updateDto.IsActive;
        permission.UpdatedAt = DateTime.UtcNow;

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
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _permissionRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var permission = getResult.Value;
        if (permission == null)
            return Result.Failure(MessageCodes.PERMISSION_NOT_FOUND);

        permission.IsDeleted = true;
        permission.DeletedAt = DateTime.UtcNow;
        permission.UpdatedAt = DateTime.UtcNow;

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

    #region Private Helper Methods

    private static Expression<Func<Permission, bool>> BuildFilter(bool activeOnly)
    {
        return p => !p.IsDeleted && (!activeOnly || p.IsActive);
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

        if (createDto.Name.Length > 50)
            return Result.Failure(MessageCodes.PERMISSION_NAME_TOO_LONG);

        return Result.Success();
    }

    private static Result ValidateUpdatePermissionDto(UpdatePermissionDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.PERMISSION_NAME_REQUIRED);

        if (updateDto.Name.Length > 50)
            return Result.Failure(MessageCodes.PERMISSION_NAME_TOO_LONG);

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
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt,
        };
    }

    private static PermissionDropdownDto MapToDropdownDto(Permission permission)
    {
        return new PermissionDropdownDto
        {
            Id = permission.Id,
            Name = permission.Name,
        };
    }

    #endregion
}
