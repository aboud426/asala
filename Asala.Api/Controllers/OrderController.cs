using Asala.Api.Controllers;
using Asala.UseCases.Shopping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : BaseController
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrder(int orderId, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _orderService.GetOrderByIdAsync(userId, orderId, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _orderService.GetUserOrdersAsync(userId, page, pageSize, cancellationToken);
        
        return CreateResponse(result);
    }
}
