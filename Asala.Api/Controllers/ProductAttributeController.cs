using Asala.Core.Modules.Products.DTOs;
using Asala.UseCases.Products.AddProductAttributeLocalization;
using Asala.UseCases.Products.CreateProductAttribute;
using Asala.UseCases.Products.DeleteProductAttribute;
using Asala.UseCases.Products.GetProductAttributeById;
using Asala.UseCases.Products.GetProductAttributesDropdown;
using Asala.UseCases.Products.GetProductAttributesPaginated;
using Asala.UseCases.Products.RemoveProductAttributeLocalization;
using Asala.UseCases.Products.ToggleProductAttributeActivation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Product attribute management controller for handling attribute operations
/// </summary>
[ApiController]
[Route("api/product-attributes")]
public class ProductAttributeController : BaseController
{
    private readonly IMediator _mediator;

    public ProductAttributeController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of product attributes
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active status (default: true)</param>
    /// <param name="searchTerm">Search term for name filtering</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of product attributes</returns>
    /// <response code="200">Product attributes retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetProductAttributesPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = true,
        [FromQuery] string? searchTerm = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributesPaginatedQuery
        {
            Page = page,
            PageSize = pageSize,
            ActiveOnly = activeOnly,
            SearchTerm = searchTerm
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get product attributes for dropdown selection
    /// </summary>
    /// <param name="activeOnly">Filter by active status (default: true)</param>
    /// <param name="languageId">Language ID for localized names (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of product attributes for dropdown</returns>
    /// <response code="200">Dropdown items retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetProductAttributesDropdown(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int? languageId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributesDropdownQuery
        {
            ActiveOnly = activeOnly,
            LanguageId = languageId
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get product attribute by ID
    /// </summary>
    /// <param name="id">Product attribute ID</param>
    /// <param name="includeInactive">Include inactive localizations and values (default: false)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Product attribute details with localizations and values</returns>
    /// <response code="200">Product attribute retrieved successfully</response>
    /// <response code="400">Invalid product attribute ID</response>
    /// <response code="404">Product attribute not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductAttributeById(
        int id,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetProductAttributeByIdQuery
        {
            Id = id,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new product attribute
    /// </summary>
    /// <param name="createDto">Product attribute creation data including name and localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created product attribute with localization details</returns>
    /// <response code="200">Product attribute created successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="409">Attribute with the same name already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> CreateProductAttribute(
        [FromBody] CreateProductAttributeDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var command = new CreateProductAttributeCommand
        {
            Name = createDto.Name,
            IsActive = createDto.IsActive,
            Localizations = createDto.Localizations
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle product attribute activation status
    /// </summary>
    /// <param name="id">Product attribute ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Product attribute activation status toggled successfully</response>
    /// <response code="400">Invalid product attribute ID</response>
    /// <response code="404">Product attribute not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleProductAttributeActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var command = new ToggleProductAttributeActivationCommand
        {
            Id = id
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Add localization to an existing product attribute
    /// </summary>
    /// <param name="id">Product attribute ID</param>
    /// <param name="localizationDto">Localization data including language ID and name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created localization details</returns>
    /// <response code="200">Localization added successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">Product attribute or language not found</response>
    /// <response code="409">Localization already exists for this language</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{id}/localizations")]
    public async Task<IActionResult> AddProductAttributeLocalization(
        int id,
        [FromBody] AddProductAttributeLocalizationDto localizationDto,
        CancellationToken cancellationToken = default
    )
    {
        var command = new AddProductAttributeLocalizationCommand
        {
            ProductAttributeId = id,
            LanguageId = localizationDto.LanguageId,
            Name = localizationDto.Name,
            IsActive = localizationDto.IsActive
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a product attribute (soft delete)
    /// </summary>
    /// <param name="id">Product attribute ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Product attribute deleted successfully</response>
    /// <response code="400">Invalid product attribute ID</response>
    /// <response code="404">Product attribute not found</response>
    /// <response code="409">Cannot delete attribute that is assigned to products</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductAttribute(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var command = new DeleteProductAttributeCommand
        {
            Id = id
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Remove a specific localization from a product attribute
    /// </summary>
    /// <param name="id">Product attribute ID</param>
    /// <param name="languageId">Language ID of the localization to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Localization removed successfully</response>
    /// <response code="400">Invalid IDs or cannot remove last localization</response>
    /// <response code="404">Product attribute, language, or localization not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}/localizations/{languageId}")]
    public async Task<IActionResult> RemoveProductAttributeLocalization(
        int id,
        int languageId,
        CancellationToken cancellationToken = default
    )
    {
        var command = new RemoveProductAttributeLocalizationCommand
        {
            ProductAttributeId = id,
            LanguageId = languageId
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
