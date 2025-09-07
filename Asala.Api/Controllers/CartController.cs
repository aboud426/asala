using Asala.Api.Controllers;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.UseCases.Shopping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : BaseController
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.GetUserCartAsync(userId, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpPost("add-product")]
    public async Task<IActionResult> AddProductToCart([FromBody] AddToCartDto addToCartDto, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.AddProductToCartAsync(userId, addToCartDto, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpPut("update-quantity/{cartItemId}")]
    public async Task<IActionResult> UpdateCartItemQuantity(int cartItemId, [FromBody] int newQuantity, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, newQuantity, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.RemoveFromCartAsync(userId, cartItemId, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.ClearCartAsync(userId, cancellationToken);
        
        return CreateResponse(result);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto checkoutDto, CancellationToken cancellationToken = default)
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _cartService.CheckoutAsync(userId, checkoutDto, cancellationToken);
        
        return CreateResponse(result);
    }
}
