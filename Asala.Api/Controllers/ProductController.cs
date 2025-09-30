using Asala.Core.Modules.Products.DTOs;
using Asala.UseCases.Products;
using Asala.UseCases.Products.FilterProducts;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : BaseController
{
    private readonly IProductService _productService;
    private readonly IMediator _mediator;

    public ProductController(IProductService productService, IMediator mediator)
        : base()
    {
        _productService = productService;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginatedLocalized(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string languageCode = "en",
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.GetPaginatedLocalizedAsync(
            page,
            pageSize,
            languageCode,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("by-page/{productsPagesId}")]
    public async Task<IActionResult> GetProductsByPageWithCursor(
        [FromRoute] int productsPagesId,
        [FromQuery] string languageCode = "en",
        [FromQuery] int? cursor = null,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.GetProductsByPageWithCursorAsync(
            productsPagesId,
            languageCode,
            cursor,
            pageSize,
            true,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpPost("create-product")]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductWithMediaDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.CreateWithMediaAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        [FromRoute] int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] int id,
        [FromBody] UpdateProductWithMediaDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.UpdateWithMediaAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Filter products with advanced filtering capabilities
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="languageCode">Language code for localization (default: en)</param>
    /// <param name="activeOnly">Filter by active status (default: true)</param>
    /// <param name="searchTerm">Search term for name/description filtering</param>
    /// <param name="categoryId">Filter by category ID</param>
    /// <param name="minPrice">Minimum price filter</param>
    /// <param name="maxPrice">Maximum price filter</param>
    /// <param name="currencyId">Filter by currency ID</param>
    /// <param name="attributeFilters">Attribute filters in format: attributeId1:valueId1,valueId2|attributeId2:valueId3</param>
    /// <param name="sortBy">Sort field (Name, Price, CreatedAt)</param>
    /// <param name="sortDescending">Sort direction (default: true for descending)</param>
    /// <param name="includeFilterSummary">Include filter summary with available options</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered products with optional filter summary</returns>
    /// <response code="200">Products filtered successfully</response>
    /// <response code="400">Invalid filter parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("filter")]
    public async Task<IActionResult> FilterProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? languageCode = "en",
        [FromQuery] bool? activeOnly = true,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? currencyId = null,
        [FromQuery] string? attributeFilters = null,
        [FromQuery] ProductSortBy sortBy = ProductSortBy.CreatedAt,
        [FromQuery] bool sortDescending = true,
        [FromQuery] bool includeFilterSummary = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = new FilterProductsQuery
        {
            Page = page,
            PageSize = pageSize,
            LanguageCode = languageCode,
            ActiveOnly = activeOnly,
            SearchTerm = searchTerm,
            CategoryId = categoryId,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            CurrencyId = currencyId,
            AttributeFilters = ParseAttributeFilters(attributeFilters),
            SortBy = sortBy,
            SortDescending = sortDescending,
            IncludeFilterSummary = includeFilterSummary
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Filter products using POST method for complex filter objects
    /// </summary>
    /// <param name="filterDto">Complete filter criteria</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered products with optional filter summary</returns>
    /// <response code="200">Products filtered successfully</response>
    /// <response code="400">Invalid filter parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("filter")]
    public async Task<IActionResult> FilterProductsPost(
        [FromBody] ProductFilterDto filterDto,
        CancellationToken cancellationToken = default
    )
    {
        var query = new FilterProductsQuery
        {
            Page = filterDto.Page,
            PageSize = filterDto.PageSize,
            LanguageCode = filterDto.LanguageCode,
            ActiveOnly = filterDto.ActiveOnly,
            SearchTerm = filterDto.SearchTerm,
            CategoryId = filterDto.CategoryId,
            MinPrice = filterDto.MinPrice,
            MaxPrice = filterDto.MaxPrice,
            CurrencyId = filterDto.CurrencyId,
            AttributeFilters = filterDto.AttributeFilters,
            SortBy = filterDto.SortBy,
            SortDescending = filterDto.SortDescending,
            IncludeFilterSummary = true // Always include summary for POST requests
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    private List<ProductAttributeFilterDto> ParseAttributeFilters(string? attributeFilters)
    {
        var filters = new List<ProductAttributeFilterDto>();
        
        if (string.IsNullOrWhiteSpace(attributeFilters))
            return filters;

        try
        {
            // Format: "attributeId1:valueId1,valueId2|attributeId2:valueId3,valueId4"
            var attributePairs = attributeFilters.Split('|', StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var pair in attributePairs)
            {
                var parts = pair.Split(':', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 && int.TryParse(parts[0], out var attributeId))
                {
                    var valueIds = parts[1]
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Where(v => int.TryParse(v, out _))
                        .Select(int.Parse)
                        .ToList();

                    if (valueIds.Any())
                    {
                        filters.Add(new ProductAttributeFilterDto
                        {
                            AttributeId = attributeId,
                            ValueIds = valueIds
                        });
                    }
                }
            }
        }
        catch
        {
            // Return empty filters if parsing fails
            return new List<ProductAttributeFilterDto>();
        }

        return filters;
    }

    // [HttpPost("create-post")]
    // public async Task<IActionResult> CreateProductPost(
    //     [FromBody] CreateProductPostDto createDto,
    //     CancellationToken cancellationToken = default
    // )
    // {
    //     int userId = 1; // This should come from authentication context

    //     var result = await _productService.CreateProductPostAsync(
    //         createDto,
    //         userId,
    //         cancellationToken
    //     );
    //     return CreateResponse(result);
    // }
}
