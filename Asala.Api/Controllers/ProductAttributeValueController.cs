using Asala.Core.Modules.Products.DTOs;
using Asala.UseCases.Products.AddProductAttributeValueLocalization;
using Asala.UseCases.Products.CreateProductAttributeValue;
using Asala.UseCases.Products.DeleteProductAttributeValue;
using Asala.UseCases.Products.GetProductAttributeValueById;
using Asala.UseCases.Products.GetProductAttributeValuesDropdown;
using Asala.UseCases.Products.GetProductAttributeValuesPaginated;
using Asala.UseCases.Products.RemoveProductAttributeValueLocalization;
using Asala.UseCases.Products.ToggleProductAttributeValueActivation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Product attribute value management controller for handling attribute value operations
/// </summary>
[ApiController]
[Route("api/product-attribute-values")]
[Authorize]
public class ProductAttributeValueController : BaseController
{
    private readonly IMediator _mediator;

    public ProductAttributeValueController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of product attribute values
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active status (default: true)</param>
    /// <param name="searchTerm">Search term for value filtering</param>
    /// <param name="productAttributeId">Filter by specific product attribute ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of product attribute values</returns>
    /// <response code="200">Product attribute values retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetProductAttributeValuesPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = true,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? productAttributeId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributeValuesPaginatedQuery
        {
            Page = page,
            PageSize = pageSize,
            ActiveOnly = activeOnly,
            SearchTerm = searchTerm,
            ProductAttributeId = productAttributeId
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get product attribute values for dropdown selection
    /// </summary>
    /// <param name="activeOnly">Filter by active status (default: true)</param>
    /// <param name="languageId">Language ID for localized values (optional)</param>
    /// <param name="productAttributeId">Filter by specific product attribute ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of product attribute values for dropdown</returns>
    /// <response code="200">Dropdown items retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetProductAttributeValuesDropdown(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int? languageId = null,
        [FromQuery] int? productAttributeId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributeValuesDropdownQuery
        {
            ActiveOnly = activeOnly,
            LanguageId = languageId,
            ProductAttributeId = productAttributeId
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get product attribute value by ID
    /// </summary>
    /// <param name="id">Product attribute value ID</param>
    /// <param name="includeInactive">Include inactive localizations (default: false)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Product attribute value details with localizations</returns>
    /// <response code="200">Product attribute value retrieved successfully</response>
    /// <response code="400">Invalid product attribute value ID</response>
    /// <response code="404">Product attribute value not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductAttributeValueById(
        int id,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributeValueByIdQuery
        {
            Id = id,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new product attribute value
    /// </summary>
    /// <param name="createDto">Product attribute value creation data including value and localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created product attribute value details</returns>
    /// <response code="200">Product attribute value created successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">Product attribute not found</response>
    /// <response code="409">Value already exists for this attribute</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> CreateProductAttributeValue(
        [FromBody] CreateProductAttributeValueDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var command = new CreateProductAttributeValueCommand
        {
            ProductAttributeId = createDto.ProductAttributeId,
            Value = createDto.Value,
            IsActive = createDto.IsActive,
            Localizations = createDto.Localizations
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle activation status of a product attribute value
    /// </summary>
    /// <param name="id">Product attribute value ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Activation status toggled successfully</response>
    /// <response code="400">Invalid product attribute value ID</response>
    /// <response code="404">Product attribute value not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleProductAttributeValueActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var command = new ToggleProductAttributeValueActivationCommand
        {
            Id = id
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Add localization to an existing product attribute value
    /// </summary>
    /// <param name="id">Product attribute value ID</param>
    /// <param name="localizationDto">Localization data including language ID and value</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created localization details</returns>
    /// <response code="200">Localization added successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">Product attribute value or language not found</response>
    /// <response code="409">Localization already exists for this language</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{id}/localizations")]
    public async Task<IActionResult> AddProductAttributeValueLocalization(
        int id,
        [FromBody] AddProductAttributeValueLocalizationDto localizationDto,
        CancellationToken cancellationToken = default
    )
    {
        var command = new AddProductAttributeValueLocalizationCommand
        {
            ProductAttributeValueId = id,
            LanguageId = localizationDto.LanguageId,
            Value = localizationDto.Value,
            IsActive = localizationDto.IsActive
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a product attribute value (soft delete)
    /// </summary>
    /// <param name="id">Product attribute value ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Product attribute value deleted successfully</response>
    /// <response code="400">Invalid product attribute value ID</response>
    /// <response code="404">Product attribute value not found</response>
    /// <response code="409">Cannot delete value that is assigned to products</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductAttributeValue(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var command = new DeleteProductAttributeValueCommand
        {
            Id = id
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Remove a specific localization from a product attribute value
    /// </summary>
    /// <param name="id">Product attribute value ID</param>
    /// <param name="languageId">Language ID of the localization to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Localization removed successfully</response>
    /// <response code="400">Invalid IDs</response>
    /// <response code="404">Product attribute value, language, or localization not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}/localizations/{languageId}")]
    public async Task<IActionResult> RemoveProductAttributeValueLocalization(
        int id,
        int languageId,
        CancellationToken cancellationToken = default
    )
    {
        var command = new RemoveProductAttributeValueLocalizationCommand
        {
            ProductAttributeValueId = id,
            LanguageId = languageId
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
