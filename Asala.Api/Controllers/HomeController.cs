using Asala.UseCases.Home;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Home page controller for retrieving home page information
/// </summary>
[ApiController]
[Route("api/home")]
public class HomeController : BaseController
{
    private readonly IMediator _mediator;

    public HomeController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get home page information including top posts and recent products
    /// </summary>
    /// <param name="languageCode">Language code for localized content (e.g., 'en', 'ar')</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Home page information with localized content</returns>
    /// <response code="200">Home page information retrieved successfully</response>
    /// <response code="400">Invalid language code</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetHomePageInfo(
        [FromQuery] string languageCode = "en",
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetHomePageInfoQuery
        {
            LanguageCode = languageCode
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }
}
