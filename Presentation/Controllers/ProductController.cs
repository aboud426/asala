using Microsoft.AspNetCore.Mvc;
using Business.Services;
using Infrastructure.Common;
using Infrastructure.Models;
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
        
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        if (result.Value == null)
            return NotFound();

        return Ok(result.Value);
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
            return BadRequest(new { error = "Invalid pagination parameters" });

        var result = await _productService.GetProductsAsync(page, pageSize, cancellationToken);
        
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
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
        
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
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
            return BadRequest(ModelState);

        var result = await _productService.CreateProductAsync(
            request.Name,
            request.CategoryId,
            request.ProviderId,
            request.Price,
            request.Quantity,
            request.Description,
            cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(
            nameof(GetProduct), 
            new { id = result.Value!.Id }, 
            result.Value);
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
            return BadRequest(ModelState);

        // First get the existing product
        var existingResult = await _productService.GetProductByIdAsync(id, cancellationToken);
        if (existingResult.IsFailure)
            return BadRequest(new { error = existingResult.Error });

        if (existingResult.Value == null)
            return NotFound();

        // Update the product
        var product = existingResult.Value;
        product.Name = request.Name;
        product.CategoryId = request.CategoryId;
        product.Price = request.Price;
        product.Quantity = request.Quantity;
        product.Description = request.Description;

        var result = await _productService.UpdateProductAsync(product, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(new { message = "Product updated successfully" });
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
            return BadRequest(new { error = "Quantity cannot be negative" });

        var result = await _productService.UpdateProductQuantityAsync(id, request.Quantity, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(new { message = "Quantity updated successfully" });
    }

    /// <summary>
    /// Delete a product (cache invalidation happens automatically)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        var result = await _productService.DeleteProductAsync(id, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(new { message = "Product deleted successfully" });
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

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(new { available = result.Value, productId = id, requestedQuantity = quantity });
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