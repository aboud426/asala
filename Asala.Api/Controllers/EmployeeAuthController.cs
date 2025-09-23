using Asala.Core.Common.Jwt;
using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Employee authentication controller for handling login, logout, and password management
/// </summary>
[ApiController]
[Route("api/auth/employee")]
public class EmployeeAuthController : BaseController
{
    private readonly IAuthenticationService _authenticationService;
    private readonly JwtService _jwtService;

    public EmployeeAuthController(
        IAuthenticationService authenticationService,
        JwtService jwtService
    )
        : base()
    {
        _authenticationService = authenticationService;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Authenticate employee using email and password
    /// </summary>
    /// <param name="loginDto">Login credentials including email and password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with user details and JWT access token</returns>
    /// <response code="200">Login successful with JWT token</response>
    /// <response code="400">Invalid credentials or validation error</response>
    /// <response code="401">Account is not active or credentials are invalid</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto loginDto,
        CancellationToken cancellationToken = default
    )
    {
        var authResult = await _authenticationService.LoginEmployeeAsync(
            loginDto,
            cancellationToken
        );

        if (authResult.IsFailure)
        {
            return CreateResponse(authResult);
        }

        var authResponse = authResult.Value;

        // Generate JWT token using JwtService
        var token = _jwtService.GenerateToken(
            authResponse.User.Id,
            authResponse.User.Email,
            "Employee",
            Guid.NewGuid().ToString()
        );

        // Update the response with the generated token
        authResponse.Token = token;
        authResponse.ExpiresAt = DateTime.UtcNow.AddHours(24); // Match the JWT expiry

        return CreateResponse(Core.Common.Models.Result.Success(authResponse));
    }

    /// <summary>
    /// Logout employee (invalidates the current session)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response indicating logout completion</returns>
    /// <response code="200">Logout successful</response>
    /// <response code="500">Internal server error</response>
    /// <remarks>
    /// Since JWT tokens are stateless, this endpoint primarily serves to provide
    /// a consistent API. Token invalidation should be handled on the client side
    /// by removing the token from storage.
    /// </remarks>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        // For JWT-based authentication, logout is typically handled client-side
        // by removing the token from storage. This endpoint provides API consistency.
        await Task.CompletedTask; // Prevent compiler warning for unused parameter

        return CreateResponse(Core.Common.Models.Result.Success());
    }

    /// <summary>
    /// Change employee password
    /// </summary>
    /// <param name="userId">Employee user ID</param>
    /// <param name="changePasswordDto">Password change data including current and new password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response indicating password change completion</returns>
    /// <response code="200">Password changed successfully</response>
    /// <response code="400">Invalid password data or validation error</response>
    /// <response code="401">Current password is incorrect</response>
    /// <response code="404">Employee not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{userId}/change-password")]
    public async Task<IActionResult> ChangePassword(
        int userId,
        [FromBody] ChangePasswordDto changePasswordDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _authenticationService.ChangePasswordAsync(
            userId,
            changePasswordDto.CurrentPassword,
            changePasswordDto.NewPassword,
            cancellationToken
        );

        return CreateResponse(result);
    }

    /// <summary>
    /// Validate employee password
    /// </summary>
    /// <param name="userId">Employee user ID</param>
    /// <param name="password">Password to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response if password is valid</returns>
    /// <response code="200">Password is valid</response>
    /// <response code="400">Invalid password or validation error</response>
    /// <response code="401">Password is incorrect</response>
    /// <response code="404">Employee not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{userId}/validate-password")]
    public async Task<IActionResult> ValidatePassword(
        int userId,
        [FromBody] string password,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _authenticationService.ValidatePasswordAsync(
            userId,
            password,
            cancellationToken
        );

        return CreateResponse(result);
    }
}
