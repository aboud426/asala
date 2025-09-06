using Asala.Core.Modules.Posts.DTOs;
using Asala.UseCases.Posts;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : BaseController
{
    private readonly IPostService _postService;

    public PostController(IPostService postService)
        : base()
    {
        _postService = postService;
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
        var result = await _postService.GetPaginatedLocalizedAsync(
            page,
            pageSize,
            languageCode,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePostWithMediaDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // TODO: Get userId from JWT token instead of hardcoding
        int userId = 1; // This should come from authentication context
        
        var result = await _postService.CreateWithMediaAsync(createDto, userId, cancellationToken);
        return CreateResponse(result);
    }
}
