// using Asala.Core.Modules.Users.DTOs;
// using Asala.UseCases.Users;
// using Microsoft.AspNetCore.Mvc;

// namespace Asala.Api.Controllers;

// [ApiController]
// [Route("api/customers")]
// public class CustomerController : BaseController
// {
//     private readonly ICustomerService _customerService;
//     private readonly IAuthenticationService _authenticationService;
//     private readonly IOtpService _otpService;

//     public CustomerController(ICustomerService customerService, IAuthenticationService authenticationService, IOtpService otpService) : base()
//     {
//         _customerService = customerService;
//         _authenticationService = authenticationService;
//         _otpService = otpService;
//     }

//     /// <summary>
//     /// Request OTP for customer authentication
//     /// </summary>
//     /// <param name="requestDto">OTP request details including phone number and purpose (Login/Registration)</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>OTP response with success status and expiry time</returns>
//     /// <response code="200">OTP sent successfully</response>
//     /// <response code="400">Invalid request data or rate limit exceeded</response>
//     /// <response code="500">Internal server error</response>
//     [HttpPost("request-otp")]
//     public async Task<IActionResult> RequestOtp(
//         [FromBody] RequestOtpDto requestDto,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _otpService.RequestOtpAsync(requestDto, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Verify OTP code for customer authentication
//     /// </summary>
//     /// <param name="verifyDto">OTP verification details including phone number, code, and purpose</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Verification result indicating success or failure</returns>
//     /// <response code="200">OTP verified successfully</response>
//     /// <response code="400">Invalid OTP code or expired OTP</response>
//     /// <response code="500">Internal server error</response>
//     [HttpPost("verify-otp")]
//     public async Task<IActionResult> VerifyOtp(
//         [FromBody] VerifyOtpDto verifyDto,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _otpService.VerifyOtpAsync(verifyDto, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Register a new customer using phone number and OTP verification
//     /// </summary>
//     /// <param name="createDto">Customer registration data including name, phone number, and verified OTP code</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Authentication response with user details (token will be null as requested)</returns>
//     /// <response code="200">Customer registered successfully</response>
//     /// <response code="400">Invalid data, phone number already exists, or OTP verification failed</response>
//     /// <response code="500">Internal server error</response>
//     [HttpPost("register")]
//     public async Task<IActionResult> Register(
//         [FromBody] CreateCustomerDto createDto,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.CreateAsync(createDto, cancellationToken);
//         if (result.IsFailure)
//         {
//             return CreateResponse(result);
//         }

//         // For now, return null token as requested
//         var taken = null as string;
        
//         var authResponse = new AuthResponseDto
//         {
//             Token = taken!,
//             User = new UserDto
//             {
//                 Id = result.Value!.UserId,
//                 Email = $"customer_{result.Value.PhoneNumber}@temp.com", // Temporary email
//                 PhoneNumber = result.Value.PhoneNumber,
//                 LocationId = null, // Customer doesn't store LocationId directly
//                 IsActive = result.Value.IsActive,
//                 CreatedAt = result.Value.CreatedAt,
//                 UpdatedAt = result.Value.UpdatedAt
//             },
//             ExpiresAt = DateTime.UtcNow.AddHours(24)
//         };

//         return CreateResponse(Core.Common.Models.Result.Success(authResponse));
//     }

//     /// <summary>
//     /// Authenticate customer using phone number and OTP code
//     /// </summary>
//     /// <param name="loginDto">Login credentials including phone number and OTP code</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Authentication response with user details and access token</returns>
//     /// <response code="200">Login successful</response>
//     /// <response code="400">Invalid credentials or OTP verification failed</response>
//     /// <response code="401">Account is not active</response>
//     /// <response code="500">Internal server error</response>
//     [HttpPost("login")]
//     public async Task<IActionResult> Login(
//         [FromBody] CustomerLoginDto loginDto,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _authenticationService.LoginCustomerAsync(loginDto, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Logout customer (currently returns success as token handling is not implemented)
//     /// </summary>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Success response</returns>
//     /// <response code="200">Logout successful</response>
//     [HttpPost("logout")]
//     public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
//     {
//         // For now, just return success as no token handling is implemented
//         return CreateResponse(Core.Common.Models.Result.Success());
//     }

//     /// <summary>
//     /// Get paginated list of customers
//     /// </summary>
//     /// <param name="page">Page number (default: 1)</param>
//     /// <param name="pageSize">Number of items per page (default: 10)</param>
//     /// <param name="activeOnly">Filter by active customers only (default: true)</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Paginated list of customers</returns>
//     /// <response code="200">Customers retrieved successfully</response>
//     /// <response code="400">Invalid pagination parameters</response>
//     /// <response code="500">Internal server error</response>
//     [HttpGet]
//     public async Task<IActionResult> GetAll(
//         [FromQuery] int page = 1,
//         [FromQuery] int pageSize = 10,
//         [FromQuery] bool activeOnly = true,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Get customer details by user ID
//     /// </summary>
//     /// <param name="userId">The user ID of the customer</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Customer details</returns>
//     /// <response code="200">Customer found</response>
//     /// <response code="404">Customer not found</response>
//     /// <response code="500">Internal server error</response>
//     [HttpGet("{userId}")]
//     public async Task<IActionResult> GetById(int userId, CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.GetByUserIdAsync(userId, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Update customer information
//     /// </summary>
//     /// <param name="userId">The user ID of the customer to update</param>
//     /// <param name="updateDto">Updated customer data</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Updated customer details</returns>
//     /// <response code="200">Customer updated successfully</response>
//     /// <response code="400">Invalid data or phone number already exists</response>
//     /// <response code="404">Customer not found</response>
//     /// <response code="500">Internal server error</response>
//     [HttpPut("{userId}")]
//     public async Task<IActionResult> Modify(
//         int userId,
//         [FromBody] UpdateCustomerDto updateDto,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.UpdateAsync(userId, updateDto, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Soft delete a customer (marks as deleted without removing from database)
//     /// </summary>
//     /// <param name="userId">The user ID of the customer to delete</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Success response</returns>
//     /// <response code="200">Customer deleted successfully</response>
//     /// <response code="404">Customer not found</response>
//     /// <response code="500">Internal server error</response>
//     [HttpDelete("{userId}")]
//     public async Task<IActionResult> Delete(int userId, CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.SoftDeleteAsync(userId, cancellationToken);
//         return CreateResponse(result);
//     }

//     /// <summary>
//     /// Search customers by name with pagination and sorting
//     /// </summary>
//     /// <param name="searchTerm">Search term to match customer names (supports partial matching)</param>
//     /// <param name="page">Page number (default: 1)</param>
//     /// <param name="pageSize">Number of items per page (default: 10)</param>
//     /// <param name="activeOnly">Filter by active customers only (default: true)</param>
//     /// <param name="sortBy">Sort criteria (Name) (default: Name)</param>
//     /// <param name="cancellationToken">Cancellation token</param>
//     /// <returns>Paginated list of matching customers</returns>
//     /// <response code="200">Search completed successfully</response>
//     /// <response code="400">Invalid search parameters</response>
//     /// <response code="500">Internal server error</response>
//     [HttpGet("search")]
//     public async Task<IActionResult> SearchByName(
//         [FromQuery] string searchTerm,
//         [FromQuery] int page = 1,
//         [FromQuery] int pageSize = 10,
//         [FromQuery] bool activeOnly = true,
//         [FromQuery] CustomerSortBy sortBy = CustomerSortBy.Name,
//         CancellationToken cancellationToken = default)
//     {
//         var result = await _customerService.SearchByNameAsync(searchTerm, page, pageSize, activeOnly, sortBy, cancellationToken);
//         return CreateResponse(result);
//     }
// }