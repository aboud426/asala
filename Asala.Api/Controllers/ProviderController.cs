using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/providers")]
public class ProviderController : BaseController
{
    private readonly IProviderService _providerService;
    private readonly IAuthenticationService _authenticationService;
    private readonly IOtpService _otpService;

    public ProviderController(
        IProviderService providerService,
        IAuthenticationService authenticationService,
        IOtpService otpService
    )
        : base()
    {
        _providerService = providerService;
        _authenticationService = authenticationService;
        _otpService = otpService;
    }

    /// <summary>
    /// Request OTP for provider authentication
    /// </summary>
    /// <param name="requestDto">OTP request details including phone number and purpose (Login/Registration)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>OTP response with success status and expiry time</returns>
    /// <response code="200">OTP sent successfully</response>
    /// <response code="400">Invalid request data or rate limit exceeded</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("request-otp")]
    public async Task<IActionResult> RequestOtp(
        [FromBody] RequestOtpDto requestDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _otpService.RequestOtpAsync(requestDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Verify OTP code for provider authentication
    /// </summary>
    /// <param name="verifyDto">OTP verification details including phone number, code, and purpose</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Verification result indicating success or failure</returns>
    /// <response code="200">OTP verified successfully</response>
    /// <response code="400">Invalid OTP code or expired OTP</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(
        [FromBody] VerifyOtpDto verifyDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _otpService.VerifyOtpAsync(verifyDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Register a new provider using phone number and OTP verification
    /// </summary>
    /// <param name="createDto">Provider registration data including business details, phone number, and verified OTP code</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with user details (token will be null as requested)</returns>
    /// <response code="200">Provider registered successfully</response>
    /// <response code="400">Invalid data, phone number already exists, or OTP verification failed</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] CreateProviderDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.CreateAsync(createDto, cancellationToken);
        if (result.IsFailure)
        {
            return CreateResponse(result);
        }

        // For now, return null token as requested
        var taken = null as string;

        var authResponse = new AuthResponseDto
        {
            Token = taken!,
            User = new UserDto
            {
                Id = result.Value!.UserId,
                Email = $"provider_{result.Value.PhoneNumber}@temp.com", // Temporary email
                PhoneNumber = result.Value.PhoneNumber,
                LocationId = null, // Provider doesn't store LocationId directly in DTO
                IsActive = result.Value.IsActive,
                CreatedAt = result.Value.CreatedAt,
                UpdatedAt = result.Value.UpdatedAt,
            },
            ExpiresAt = DateTime.UtcNow.AddHours(24),
        };

        return CreateResponse(Core.Common.Models.Result.Success(authResponse));
    }

    /// <summary>
    /// Authenticate provider using phone number and OTP code
    /// </summary>
    /// <param name="loginDto">Login credentials including phone number and OTP code</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with user details and access token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid credentials or OTP verification failed</response>
    /// <response code="401">Account is not active</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] ProviderLoginDto loginDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _authenticationService.LoginProviderAsync(loginDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Logout provider (currently returns success as token handling is not implemented)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Logout successful</response>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        // For now, just return success as no token handling is implemented
        return CreateResponse(Core.Common.Models.Result.Success());
    }

    /// <summary>
    /// Get paginated list of providers
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active providers only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of providers</returns>
    /// <response code="200">Providers retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get provider details by ID
    /// </summary>
    /// <param name="id">The provider ID (user ID)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Provider details including business information and localizations</returns>
    /// <response code="200">Provider found</response>
    /// <response code="404">Provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update provider information
    /// </summary>
    /// <param name="id">The provider ID (user ID) to update</param>
    /// <param name="updateDto">Updated provider data including business details and localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated provider details</returns>
    /// <response code="200">Provider updated successfully</response>
    /// <response code="400">Invalid data or phone number already exists</response>
    /// <response code="404">Provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Modify(
        int id,
        [FromBody] UpdateProviderDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a provider (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">The provider ID (user ID) to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Provider deleted successfully</response>
    /// <response code="404">Provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _providerService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Search providers by business name with pagination and sorting (includes localized content)
    /// </summary>
    /// <param name="searchTerm">Search term to match business names (supports partial matching and localization)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active providers only (default: true)</param>
    /// <param name="sortBy">Sort criteria (Name, Rating) (default: Name)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of matching providers</returns>
    /// <response code="200">Search completed successfully</response>
    /// <response code="400">Invalid search parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("search")]
    public async Task<IActionResult> SearchByBusinessName(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        [FromQuery] ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.SearchByBusinessNameAsync(
            searchTerm,
            page,
            pageSize,
            activeOnly,
            sortBy,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get hierarchical tree structure of providers
    /// </summary>
    /// <param name="rootId">Root provider ID to start the tree from (optional, null for all root providers)</param>
    /// <param name="languageCode">Language code for localized content (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Hierarchical tree structure of providers with parent-child relationships</returns>
    /// <response code="200">Provider tree retrieved successfully</response>
    /// <response code="404">Root provider not found (when rootId is specified)</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("tree")]
    public async Task<IActionResult> GetProviderTree(
        [FromQuery] int? rootId = null,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.GetProviderTreeAsync(
            rootId,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get direct child providers of a specific provider
    /// </summary>
    /// <param name="id">The parent provider ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of child providers</returns>
    /// <response code="200">Child providers retrieved successfully</response>
    /// <response code="404">Parent provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}/children")]
    public async Task<IActionResult> GetChildren(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.GetChildrenAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all localized content for a specific provider
    /// </summary>
    /// <param name="id">The provider ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of localized business names and descriptions in different languages</returns>
    /// <response code="200">Localizations retrieved successfully</response>
    /// <response code="404">Provider not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}/localizations")]
    public async Task<IActionResult> GetLocalizations(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerService.GetLocalizationsAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
