using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Db;

namespace Asala.UseCases.Users;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(IRoleRepository roleRepository, IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<RoleDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Role, bool>> filter = BuildFilter(activeOnly);

        var result = await _roleRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(r => r.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<RoleDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<RoleDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<RoleDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<RoleDto?>(idValidationResult.MessageCode);

        var result = await _roleRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<RoleDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<RoleDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<RoleDto?>(MessageCodes.ROLE_NAME_REQUIRED);

        var result = await _roleRepository.GetByNameAsync(name, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<RoleDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<RoleDto>> CreateAsync(
        CreateRoleDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateRoleDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<RoleDto>(validationResult.MessageCode);

        // Check if name already exists
        var nameExistsResult = await _roleRepository.ExistsByNameAsync(createDto.Name, cancellationToken: cancellationToken);
        if (nameExistsResult.IsFailure)
            return Result.Failure<RoleDto>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<RoleDto>(MessageCodes.ROLE_NAME_ALREADY_EXISTS);

        var role = new Role
        {
            Name = createDto.Name.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var addResult = await _roleRepository.AddAsync(role, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<RoleDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<RoleDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<RoleDto?>> UpdateAsync(
        int id,
        UpdateRoleDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<RoleDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateRoleDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<RoleDto?>(validationResult.MessageCode);

        // Check if name already exists (excluding current role)
        var nameExistsResult = await _roleRepository.ExistsByNameAsync(updateDto.Name, id, cancellationToken);
        if (nameExistsResult.IsFailure)
            return Result.Failure<RoleDto?>(nameExistsResult.MessageCode);

        if (nameExistsResult.Value)
            return Result.Failure<RoleDto?>(MessageCodes.ROLE_NAME_ALREADY_EXISTS);

        var getResult = await _roleRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<RoleDto?>(getResult.MessageCode);

        var role = getResult.Value;
        if (role == null)
            return Result.Success<RoleDto?>(null);

        role.Name = updateDto.Name.Trim();
        role.IsActive = updateDto.IsActive;
        role.UpdatedAt = DateTime.UtcNow;

        var updateResult = _roleRepository.Update(role);
        if (updateResult.IsFailure)
            return Result.Failure<RoleDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<RoleDto?>(saveResult.MessageCode);

        var dto = MapToDto(role);
        return Result.Success<RoleDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _roleRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var role = getResult.Value;
        if (role == null)
            return Result.Failure(MessageCodes.ROLE_NOT_FOUND);

        role.IsDeleted = true;
        role.DeletedAt = DateTime.UtcNow;
        role.UpdatedAt = DateTime.UtcNow;

        var updateResult = _roleRepository.Update(role);
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

        var getResult = await _roleRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var role = getResult.Value;
        if (role == null)
            return Result.Failure(MessageCodes.ROLE_NOT_FOUND);

        role.IsActive = !role.IsActive;
        role.UpdatedAt = DateTime.UtcNow;

        var updateResult = _roleRepository.Update(role);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<RoleDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Role, bool>> filter = BuildFilter(activeOnly);

        var result = await _roleRepository.GetAsync(
            filter: filter,
            orderBy: q => q.OrderBy(r => r.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<RoleDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<RoleDropdownDto>>(dtos);
    }

    #region Private Helper Methods

    private static Expression<Func<Role, bool>> BuildFilter(bool activeOnly)
    {
        return r => !r.IsDeleted && (!activeOnly || r.IsActive);
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.ROLE_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateRoleDto(CreateRoleDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.ROLE_NAME_REQUIRED);

        if (createDto.Name.Length > 50)
            return Result.Failure(MessageCodes.ROLE_NAME_TOO_LONG);

        return Result.Success();
    }

    private static Result ValidateUpdateRoleDto(UpdateRoleDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.ROLE_NAME_REQUIRED);

        if (updateDto.Name.Length > 50)
            return Result.Failure(MessageCodes.ROLE_NAME_TOO_LONG);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static RoleDto MapToDto(Role role)
    {
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt,
        };
    }

    private static RoleDropdownDto MapToDropdownDto(Role role)
    {
        return new RoleDropdownDto
        {
            Id = role.Id,
            Name = role.Name,
        };
    }

    #endregion
}
