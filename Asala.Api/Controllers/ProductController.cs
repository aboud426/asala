using Asala.Core.Modules.Products.DTOs;
using Asala.UseCases.Products;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : BaseController
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
        : base()
    {
        _productService = productService;
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
