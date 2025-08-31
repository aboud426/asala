using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomerController : BaseController
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
        : base()
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.GetByUserIdAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetByEmail(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.GetByEmailAsync(email, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCustomerDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{userId}")]
    public async Task<IActionResult> Update(
        int userId,
        [FromBody] UpdateCustomerDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.UpdateAsync(userId, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{userId}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.ToggleActivationAsync(userId, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> SoftDelete(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerService.SoftDeleteAsync(userId, cancellationToken);
        return CreateResponse(result);
    }
}
