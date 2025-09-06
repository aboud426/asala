using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class RolePermissionService : IRolePermissionService
{
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RolePermissionService(
        IRolePermissionRepository rolePermissionRepository,
        IPermissionRepository permissionRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork
    )
    {
        _rolePermissionRepository = rolePermissionRepository;
        _permissionRepository = permissionRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IEnumerable<PermissionDto>>> GetPermissionsByRoleIdAsync(
        int roleId,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        // Validate role ID
        if (roleId <= 0)
            return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.INVALID_ID);

        // Check if role exists
        var roleResult = await _roleRepository.GetByIdAsync(roleId, cancellationToken);
        if (roleResult.IsFailure)
            return Result.Failure<IEnumerable<PermissionDto>>(roleResult.MessageCode);

        if (roleResult.Value == null)
            return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.ROLE_NOT_FOUND);

        // Get role permissions
        var rolePermissionsResult = await _rolePermissionRepository.GetByRoleIdAsync(
            roleId,
            cancellationToken
        );
        if (rolePermissionsResult.IsFailure)
            return Result.Failure<IEnumerable<PermissionDto>>(rolePermissionsResult.MessageCode);

        var rolePermissions = rolePermissionsResult.Value;
        if (!rolePermissions.Any())
            return Result.Success<IEnumerable<PermissionDto>>(new List<PermissionDto>());

        // Get permission IDs
        var permissionIds = rolePermissions.Select(rp => rp.PermissionId).ToList();

        // Get permissions with localizations
        var permissions = new List<PermissionDto>();
        Expression<Func<Permission, bool>> permissionFilter = p =>
            permissionIds.Contains(p.Id) && !p.IsDeleted;
        var permissionsResult = await _permissionRepository.GetWithLocalizationsAsync(
            permissionFilter
        );

        if (permissionsResult.IsSuccess && permissionsResult.Value != null)
        {
            foreach (var permission in permissionsResult.Value)
            {
                var permissionDto = MapToPermissionDto(permission, languageCode);
                permissions.Add(permissionDto);
            }
        }

        return Result.Success<IEnumerable<PermissionDto>>(permissions);
    }

    public async Task<Result<IEnumerable<PermissionDto>>> SaveRolePermissionsAsync(
        int roleId,
        IEnumerable<int> permissionIds,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        // Validate role ID
        if (roleId <= 0)
            return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.INVALID_ID);

        var permissionIdsList = permissionIds.ToList();

        // Validate permission IDs
        if (permissionIdsList.Any(id => id <= 0))
            return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.INVALID_ID);

        // Check if role exists
        var roleResult = await _roleRepository.GetByIdAsync(roleId, cancellationToken);
        if (roleResult.IsFailure)
            return Result.Failure<IEnumerable<PermissionDto>>(roleResult.MessageCode);

        if (roleResult.Value == null)
            return Result.Failure<IEnumerable<PermissionDto>>(MessageCodes.ROLE_NOT_FOUND);

        // Check if all permissions exist
        foreach (var permissionId in permissionIdsList)
        {
            var permissionResult = await _permissionRepository.GetByIdAsync(
                permissionId,
                cancellationToken
            );
            if (permissionResult.IsFailure)
                return Result.Failure<IEnumerable<PermissionDto>>(permissionResult.MessageCode);

            if (permissionResult.Value == null)
                return Result.Failure<IEnumerable<PermissionDto>>(
                    MessageCodes.PERMISSION_NOT_FOUND
                );
        }

        // Get existing role permissions
        var existingRolePermissionsResult = await _rolePermissionRepository.GetByRoleIdAsync(
            roleId,
            cancellationToken
        );
        if (existingRolePermissionsResult.IsFailure)
            return Result.Failure<IEnumerable<PermissionDto>>(
                existingRolePermissionsResult.MessageCode
            );

        var existingRolePermissions = existingRolePermissionsResult.Value.ToList();

        // Remove permissions that are no longer needed
        var permissionsToRemove = existingRolePermissions
            .Where(rp => !permissionIdsList.Contains(rp.PermissionId))
            .ToList();

        foreach (var rolePermissionToRemove in permissionsToRemove)
        {
            rolePermissionToRemove.IsDeleted = true;
            rolePermissionToRemove.DeletedAt = DateTime.UtcNow;
            rolePermissionToRemove.UpdatedAt = DateTime.UtcNow;
            _rolePermissionRepository.Update(rolePermissionToRemove);
        }

        // Add new permissions
        var existingPermissionIds = existingRolePermissions.Select(rp => rp.PermissionId).ToList();
        var permissionsToAdd = permissionIdsList.Except(existingPermissionIds).ToList();

        foreach (var permissionId in permissionsToAdd)
        {
            var rolePermission = new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false,
            };

            await _rolePermissionRepository.AddAsync(rolePermission, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return updated permissions list
        return await GetPermissionsByRoleIdAsync(roleId, languageCode, cancellationToken);
    }

    private PermissionDto MapToPermissionDto(Permission permission, string? languageCode)
    {
        var dto = new PermissionDto
        {
            Id = permission.Id,
            Name = permission.Name,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt,
            Localizations =
                permission
                    .Localizations?.Select(l => new PermissionLocalizedDto
                    {
                        Id = l.Id,
                        PermissionId = l.PermissionId,
                        LanguageId = l.LanguageId,
                        Name = l.Name,
                        Description = l.Description,
                        CreatedAt = l.CreatedAt,
                        UpdatedAt = l.UpdatedAt,
                        Language =
                            l.Language != null
                                ? new LanguageDto
                                {
                                    Id = l.Language.Id,
                                    Code = l.Language.Code,
                                    Name = l.Language.Name,
                                }
                                : null,
                    })
                    .ToList() ?? new List<PermissionLocalizedDto>(),
        };

        // If language code is provided, use localized name if available
        if (!string.IsNullOrEmpty(languageCode) && dto.Localizations.Any())
        {
            var localization = dto.Localizations.FirstOrDefault(l =>
                l.Language?.Code?.Equals(languageCode, StringComparison.OrdinalIgnoreCase) == true
            );

            if (localization != null)
            {
                dto.Name = localization.Name;
                dto.Description = localization.Description;
            }
        }

        return dto;
    }
}
