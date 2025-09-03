using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Languages;

namespace Asala.UseCases.Users;

public class ProviderService : IProviderService
{
    private readonly IProviderRepository _providerRepository;
    private readonly IProviderLocalizedRepository _providerLocalizedRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProviderService(
        IProviderRepository providerRepository,
        IProviderLocalizedRepository providerLocalizedRepository,
        IUserRepository userRepository,
        ILanguageRepository languageRepository,
        IUnitOfWork unitOfWork)
    {
        _providerRepository = providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _providerLocalizedRepository = providerLocalizedRepository ?? throw new ArgumentNullException(nameof(providerLocalizedRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _languageRepository = languageRepository ?? throw new ArgumentNullException(nameof(languageRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<ProviderDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<ProviderDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<ProviderDto>>(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        // Provider doesn't have IsActive/IsDeleted - these are in User table
        // Use repository method that joins with User table for filtering
        var result = await _providerRepository.GetPaginatedWithUserAsync(page, pageSize, activeOnly, null, cancellationToken);

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<ProviderDto>>(result.MessageCode);

        var providerDtos = new List<ProviderDto>();
        foreach (var provider in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(provider, cancellationToken);
            providerDtos.Add(dto);
        }

        var paginatedResult = new PaginatedResult<ProviderDto>(
            providerDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<ProviderDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<ProviderDto?>(MessageCodes.ENTITY_NOT_FOUND);

        var result = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<ProviderDto?>(result.MessageCode);

        if (result.Value == null)
            return Result.Success<ProviderDto?>(null);

        var dto = await MapToDtoAsync(result.Value, cancellationToken);
        return Result.Success<ProviderDto?>(dto);
    }

    public async Task<Result<ProviderDto?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<ProviderDto?>(MessageCodes.USER_EMAIL_REQUIRED);

        var userResult = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Success<ProviderDto?>(null);

        var providerResult = await _providerRepository.GetAsync(
            filter: p => p.UserId == userResult.Value.Id);

        if (providerResult.IsFailure)
            return Result.Failure<ProviderDto?>(providerResult.MessageCode);

        var provider = providerResult.Value?.FirstOrDefault();
        if (provider == null)
            return Result.Success<ProviderDto?>(null);

        var dto = await MapToDtoAsync(provider, cancellationToken);
        return Result.Success<ProviderDto?>(dto);
    }

    public async Task<Result<ProviderDto>> CreateAsync(CreateProviderDto createDto, CancellationToken cancellationToken = default)
    {
        if (createDto == null)
            return Result.Failure<ProviderDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateCreateDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProviderDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(createDto.Email, cancellationToken: cancellationToken);
        if (emailExistsResult.IsFailure)
            return Result.Failure<ProviderDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<ProviderDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Check parent provider if specified
        if (createDto.ParentId.HasValue)
        {
            var parentExistsResult = await _providerRepository.AnyAsync(
                p => p.UserId == createDto.ParentId.Value, // Fixed: UserId is primary key
                cancellationToken);
            if (parentExistsResult.IsFailure)
                return Result.Failure<ProviderDto>(parentExistsResult.MessageCode);
            if (!parentExistsResult.Value)
                return Result.Failure<ProviderDto>("Parent provider not found");
        }

        // Begin transaction for creating both User and Provider
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<ProviderDto>(transactionResult.MessageCode);

        try
        {
            // Create User first
            var user = new User
            {
                Email = createDto.Email.Trim().ToLowerInvariant(),
                PasswordHash = HashPassword(createDto.Password),
                LocationId = createDto.LocationId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var addUserResult = await _userRepository.AddAsync(user, cancellationToken);
            if (addUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProviderDto>(addUserResult.MessageCode);
            }

            var saveUserResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProviderDto>(saveUserResult.MessageCode);
            }

            // Create Provider
            var provider = new Provider
            {
                UserId = addUserResult.Value!.Id,
                BusinessName = createDto.BusinessName.Trim(),
                Description = createDto.Description.Trim(),
                Rating = createDto.Rating,
                ParentId = createDto.ParentId
                // Removed: IsActive, CreatedAt, UpdatedAt (these are in User table)
            };

            var addProviderResult = await _providerRepository.AddAsync(provider, cancellationToken);
            if (addProviderResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProviderDto>(addProviderResult.MessageCode);
            }

            var saveProviderResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveProviderResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProviderDto>(saveProviderResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<ProviderDto>(commitResult.MessageCode);
            }

            var dto = await MapToDtoAsync(addProviderResult.Value!, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<ProviderDto?>> UpdateAsync(int id, UpdateProviderDto updateDto, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<ProviderDto?>(MessageCodes.ENTITY_NOT_FOUND);

        if (updateDto == null)
            return Result.Failure<ProviderDto?>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateUpdateDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProviderDto?>(validationResult.MessageCode);

        var providerResult = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (providerResult.IsFailure)
            return Result.Failure<ProviderDto?>(providerResult.MessageCode);

        if (providerResult.Value == null)
            return Result.Success<ProviderDto?>(null);

        var provider = providerResult.Value;

        // Update provider
        provider.BusinessName = updateDto.BusinessName.Trim();
        provider.Description = updateDto.Description.Trim();
        provider.Rating = updateDto.Rating;
        provider.ParentId = updateDto.ParentId;
        // Removed: IsActive, UpdatedAt (these are in User table)

        _providerRepository.Update(provider);

        // Update associated user
        var userResult = await _userRepository.GetByIdAsync(provider.UserId, cancellationToken);
        if (userResult.IsSuccess && userResult.Value != null)
        {
            userResult.Value.Email = updateDto.Email.Trim().ToLowerInvariant();
            userResult.Value.LocationId = updateDto.LocationId;
            userResult.Value.IsActive = updateDto.IsActive;
            userResult.Value.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(userResult.Value);
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProviderDto?>(saveResult.MessageCode);

        var dto = await MapToDtoAsync(provider, cancellationToken);
        return Result.Success<ProviderDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        var providerResult = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (providerResult.IsFailure)
            return providerResult;

        if (providerResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        // Soft delete the associated User (which cascades to Provider)
        var userResult = await _userRepository.GetByIdAsync(providerResult.Value.UserId, cancellationToken);
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        userResult.Value.IsDeleted = true;
        userResult.Value.UpdatedAt = DateTime.UtcNow;
        userResult.Value.DeletedAt = DateTime.UtcNow;

        _userRepository.Update(userResult.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        var providerResult = await _providerRepository.GetByIdAsync(id, cancellationToken);
        if (providerResult.IsFailure)
            return providerResult;

        if (providerResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        // Toggle activation on the associated User
        var userResult = await _userRepository.GetByIdAsync(providerResult.Value.UserId, cancellationToken);
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        userResult.Value.IsActive = !userResult.Value.IsActive;
        userResult.Value.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(userResult.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<ProviderDropdownDto>>> GetDropdownAsync(bool activeOnly = true, CancellationToken cancellationToken = default)
    {
        // Use repository method that joins with User table for filtering
        var result = await _providerRepository.GetPaginatedWithUserAsync(1, 1000, activeOnly, null, cancellationToken);

        if (result.IsFailure)
            return Result.Failure<IEnumerable<ProviderDropdownDto>>(result.MessageCode);

        var dropdownDtos = new List<ProviderDropdownDto>();
        foreach (var provider in result.Value!.Items)
        {
            var userResult = await _userRepository.GetByIdAsync(provider.UserId, cancellationToken);
            dropdownDtos.Add(new ProviderDropdownDto
            {
                UserId = provider.UserId,
                BusinessName = provider.BusinessName,
                Email = userResult.IsSuccess && userResult.Value != null ? userResult.Value.Email : string.Empty
            });
        }

        return Result.Success<IEnumerable<ProviderDropdownDto>>(dropdownDtos);
    }

    public async Task<Result<IEnumerable<ProviderTreeDto>>> GetProviderTreeAsync(int? rootId = null, string? languageCode = null, CancellationToken cancellationToken = default)
    {
        // Get all providers (filtering by User.IsDeleted is handled in repository)
        var allProvidersResult = await _providerRepository.GetPaginatedWithUserAsync(1, 10000, null, null, cancellationToken);
        if (allProvidersResult.IsFailure)
            return Result.Failure<IEnumerable<ProviderTreeDto>>(allProvidersResult.MessageCode);

        var allProviders = Result.Success<IEnumerable<Provider>>(allProvidersResult.Value!.Items);

        if (allProviders.IsFailure)
            return Result.Failure<IEnumerable<ProviderTreeDto>>(allProviders.MessageCode);

        var providers = allProviders.Value!.ToList();

        if (rootId.HasValue)
        {
            var rootProvider = providers.FirstOrDefault(p => p.UserId == rootId.Value);
            if (rootProvider == null)
                return Result.Failure<IEnumerable<ProviderTreeDto>>("Root provider not found");

            var tree = await BuildProviderTreeAsync(rootProvider, providers, cancellationToken);
            return Result.Success<IEnumerable<ProviderTreeDto>>(new List<ProviderTreeDto> { tree });
        }

        var rootProviders = providers.Where(p => p.ParentId == null).ToList();
        var trees = new List<ProviderTreeDto>();
        foreach (var rootProvider in rootProviders)
        {
            var tree = await BuildProviderTreeAsync(rootProvider, providers, cancellationToken);
            trees.Add(tree);
        }

        return Result.Success<IEnumerable<ProviderTreeDto>>(trees);
    }

    public async Task<Result<PaginatedResult<ProviderDto>>> SearchByBusinessNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<ProviderDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<ProviderDto>>(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        var result = await _providerRepository.SearchByBusinessNameAsync(
            searchTerm,
            page,
            pageSize,
            activeOnly,
            sortBy,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<ProviderDto>>(result.MessageCode);

        var providerDtos = new List<ProviderDto>();
        foreach (var provider in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(provider, cancellationToken);
            providerDtos.Add(dto);
        }

        var paginatedResult = new PaginatedResult<ProviderDto>(
            providerDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<IEnumerable<ProviderDto>>> GetChildrenAsync(
        int parentId,
        CancellationToken cancellationToken = default)
    {
        if (parentId <= 0)
            return Result.Failure<IEnumerable<ProviderDto>>(MessageCodes.ENTITY_NOT_FOUND);

        // Get children providers (filtering by User.IsDeleted is handled in repository)
        var childrenPaginatedResult = await _providerRepository.GetPaginatedWithUserAsync(1, 10000, null, parentId, cancellationToken);
        if (childrenPaginatedResult.IsFailure)
            return Result.Failure<IEnumerable<ProviderDto>>(childrenPaginatedResult.MessageCode);

        var childrenResult = Result.Success<IEnumerable<Provider>>(childrenPaginatedResult.Value!.Items);

        if (childrenResult.IsFailure)
            return Result.Failure<IEnumerable<ProviderDto>>(childrenResult.MessageCode);

        var childrenDtos = new List<ProviderDto>();
        foreach (var child in childrenResult.Value!)
        {
            var dto = await MapToDtoAsync(child, cancellationToken);
            childrenDtos.Add(dto);
        }

        return Result.Success<IEnumerable<ProviderDto>>(childrenDtos);
    }

    public async Task<Result<IEnumerable<ProviderLocalizedDto>>> GetLocalizationsAsync(
        int providerId,
        CancellationToken cancellationToken = default)
    {
        if (providerId <= 0)
            return Result.Failure<IEnumerable<ProviderLocalizedDto>>(MessageCodes.ENTITY_NOT_FOUND);

        // Check if provider exists
        var providerResult = await _providerRepository.GetByIdAsync(providerId, cancellationToken);
        if (providerResult.IsFailure || providerResult.Value == null)
            return Result.Failure<IEnumerable<ProviderLocalizedDto>>(MessageCodes.ENTITY_NOT_FOUND);

        var localizations = await GetProviderLocalizationsAsync(providerId, cancellationToken);
        return Result.Success<IEnumerable<ProviderLocalizedDto>>(localizations);
    }

    private async Task<ProviderTreeDto> BuildProviderTreeAsync(Provider provider, List<Provider> allProviders, CancellationToken cancellationToken = default)
    {
        var localizations = await GetProviderLocalizationsAsync(provider.UserId, cancellationToken);
        var userResult = await _userRepository.GetByIdAsync(provider.UserId, cancellationToken);

        var treeDto = new ProviderTreeDto
        {
            UserId = provider.UserId,
            BusinessName = provider.BusinessName,
            Description = provider.Description,
            Rating = provider.Rating,
            ParentId = provider.ParentId,
            IsActive = userResult.IsSuccess && userResult.Value != null ? userResult.Value.IsActive : false,
            Localizations = localizations,
            Children = new List<ProviderTreeDto>()
        };

        var children = allProviders.Where(p => p.ParentId == provider.UserId).ToList();
        foreach (var child in children)
        {
            var childTree = await BuildProviderTreeAsync(child, allProviders, cancellationToken);
            treeDto.Children.Add(childTree);
        }

        return treeDto;
    }

    private async Task<ProviderDto> MapToDtoAsync(Provider provider, CancellationToken cancellationToken = default)
    {
        var localizations = await GetProviderLocalizationsAsync(provider.UserId, cancellationToken);
        var userResult = await _userRepository.GetByIdAsync(provider.UserId, cancellationToken);

        return new ProviderDto
        {
            UserId = provider.UserId,
            Email = userResult.IsSuccess && userResult.Value != null ? userResult.Value.Email : string.Empty,
            BusinessName = provider.BusinessName,
            Description = provider.Description,
            Rating = provider.Rating,
            ParentId = provider.ParentId,
            IsActive = userResult.IsSuccess && userResult.Value != null ? userResult.Value.IsActive : false,
            CreatedAt = userResult.IsSuccess && userResult.Value != null ? userResult.Value.CreatedAt : DateTime.MinValue,
            UpdatedAt = userResult.IsSuccess && userResult.Value != null ? userResult.Value.UpdatedAt : DateTime.MinValue,
            Localizations = localizations
        };
    }

    private async Task<List<ProviderLocalizedDto>> GetProviderLocalizationsAsync(int providerId, CancellationToken cancellationToken = default)
    {
        var localizationsResult = await _providerLocalizedRepository.GetAsync(
            filter: pl => pl.ProviderId == providerId && !pl.IsDeleted);

        if (localizationsResult.IsFailure || localizationsResult.Value == null)
            return [];

        var localizations = new List<ProviderLocalizedDto>();
        foreach (var localization in localizationsResult.Value)
        {
            var languageResult = await _languageRepository.GetByIdAsync(localization.LanguageId, cancellationToken);
            if (languageResult.IsSuccess && languageResult.Value != null)
            {
                localizations.Add(new ProviderLocalizedDto
                {
                    Id = localization.Id,
                    ProviderId = localization.ProviderId,
                    LanguageId = localization.LanguageId,
                    LanguageCode = languageResult.Value.Code,
                    LanguageName = languageResult.Value.Name,
                    BusinessNameLocalized = localization.BusinessNameLocalized,
                    DescriptionLocalized = localization.DescriptionLocalized,
                    IsActive = localization.IsActive,
                    CreatedAt = localization.CreatedAt,
                    UpdatedAt = localization.UpdatedAt
                });
            }
        }

        return localizations;
    }

    private Result ValidateCreateDto(CreateProviderDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (string.IsNullOrWhiteSpace(createDto.BusinessName))
            return Result.Failure("Business name is required");

        if (string.IsNullOrWhiteSpace(createDto.Description))
            return Result.Failure("Description is required");

        if (!IsValidEmail(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        if (createDto.Password.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        return Result.Success();
    }

    private Result ValidateUpdateDto(UpdateProviderDto updateDto)
    {
        if (string.IsNullOrWhiteSpace(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (string.IsNullOrWhiteSpace(updateDto.BusinessName))
            return Result.Failure("Business name is required");

        if (string.IsNullOrWhiteSpace(updateDto.Description))
            return Result.Failure("Description is required");

        if (!IsValidEmail(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        return Result.Success();
    }

    private bool IsValidEmail(string email)
    {
        var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        return emailRegex.IsMatch(email);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
