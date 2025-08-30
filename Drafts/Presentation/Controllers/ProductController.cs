using Microsoft.AspNetCore.Mvc;
using Business.Services;
using Infrastructure.Common;
using Infrastructure.Models;
using Presentation.Extensions;
using System.Threading;
using System.Threading.Tasks;

namespace Presentation.Controllers;

/// <summary>
/// Products controller - caching happens transparently in the service layer
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService ?? throw new ArgumentNullException(nameof(productService));
    }

    /// <summary>
    /// Get a product by ID (cached automatically)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProductByIdAsync(id, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get paginated products (cached automatically)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            var validationResult = Result.Failure<PaginatedResult<Product>>(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE);
            return validationResult.ToActionResult();
        }

        var result = await _productService.GetProductsAsync(page, pageSize, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get products by category (cached automatically)
    /// </summary>
    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetProductsByCategory(
        int categoryId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        CancellationToken cancellationToken = default)
    {
        var result = await _productService.GetProductsByCategoryAsync(categoryId, page, pageSize, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Create a new product (cache invalidation happens automatically)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductRequest request, 
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure<Product>(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        var result = await _productService.CreateProductAsync(
            request.Name,
            request.CategoryId,
            request.ProviderId,
            request.Price,
            request.Quantity,
            request.Description,
            cancellationToken);

        if (result.IsSuccess)
        {
            var apiResponse = result.ToApiResponse();
            return CreatedAtAction(
                nameof(GetProduct), 
                new { id = result.Value!.Id }, 
                apiResponse);
        }

        return result.ToActionResult();
    }

    /// <summary>
    /// Update a product (cache invalidation happens automatically)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var validationResult = Result.Failure(ErrorCodes.VALIDATION_REQUIRED_FIELD);
            return validationResult.ToActionResult();
        }

        // First get the existing product
        var existingResult = await _productService.GetProductByIdAsync(id, cancellationToken);
        if (existingResult.IsFailure)
            return existingResult.ToActionResult();

        if (existingResult.Value == null)
        {
            var notFoundResult = Result.Failure(ErrorCodes.PRODUCT_NOT_FOUND);
            return notFoundResult.ToActionResult();
        }

        // Update the product
        var product = existingResult.Value;
        product.Name = request.Name;
        product.CategoryId = request.CategoryId;
        product.Price = request.Price;
        product.Quantity = request.Quantity;
        product.Description = request.Description;

        var result = await _productService.UpdateProductAsync(product, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Update product quantity (lightweight cache invalidation)
    /// </summary>
    [HttpPatch("{id}/quantity")]
    public async Task<IActionResult> UpdateQuantity(
        int id,
        [FromBody] UpdateQuantityRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Quantity < 0)
        {
            var validationResult = Result.Failure(ErrorCodes.PRODUCT_INVALID_QUANTITY);
            return validationResult.ToActionResult();
        }

        var result = await _productService.UpdateProductQuantityAsync(id, request.Quantity, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Delete a product (cache invalidation happens automatically)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        var result = await _productService.DeleteProductAsync(id, cancellationToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Check product availability (uses cached data)
    /// </summary>
    [HttpGet("{id}/availability")]
    public async Task<IActionResult> CheckAvailability(
        int id, 
        [FromQuery] int quantity = 1, 
        CancellationToken cancellationToken = default)
    {
        var result = await _productService.IsProductAvailableAsync(id, quantity, cancellationToken);
        
        if (result.IsSuccess)
        {
            var availabilityData = new { available = result.Value, productId = id, requestedQuantity = quantity };
            var successResult = Result<object>.Success(availabilityData);
            return successResult.ToActionResult();
        }

        return result.ToActionResult();
    }
}

/// <summary>
/// Request models for API endpoints
/// </summary>
public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int ProviderId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
}

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
}

public class UpdateQuantityRequest
{
    public int Quantity { get; set; }
}