using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.DTOs;

namespace Asala.UseCases.Shopping;

public interface ICartService
{
    Task<Result<CartDto>> GetUserCartAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> AddProductToCartAsync(int userId, AddToCartDto addToCartDto, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> UpdateCartItemQuantityAsync(int userId, int cartItemId, int newQuantity, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> RemoveFromCartAsync(int userId, int cartItemId, CancellationToken cancellationToken = default);
    Task<Result<CartDto>> ClearCartAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<CheckoutResultDto>> CheckoutAsync(int userId, CheckoutDto checkoutDto, CancellationToken cancellationToken = default);
}