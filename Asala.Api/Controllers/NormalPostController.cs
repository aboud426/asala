using Asala.Api.Controllers;
using Asala.UseCases.Posts.CreateNormalPost;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Normal post management controller for handling normal post operations
/// </summary>
[ApiController]
[Route("api/normal-posts")]
public class NormalPostController : BaseController
{
    private readonly ISender _mediator;

    public NormalPostController(ISender mediator)
        : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new normal post
    /// </summary>
    /// <param name="command">Normal post creation command</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created normal post data</returns>
    /// <response code="201">Normal post created successfully</response>
    /// <response code="400">Invalid input data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("create")]
    public async Task<IActionResult> CreateNormalPost(
        CreateNormalPostCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
