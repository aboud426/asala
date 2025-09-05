using Asala.Api.Models;
using Asala.Core.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers
/// </summary>
[ApiController]
public abstract class BaseController : ControllerBase
{
    private readonly ApiResponseRepresenter _responseRepresenter;

    protected BaseController()
    {
        _responseRepresenter = new ApiResponseRepresenter();
    }

    protected IActionResult CreateResponse(Result result)
    {
        var response = _responseRepresenter.Represent(result);

        if (result.IsSuccess)
        {
            return Ok(response);
        }

        return Ok(response);
    }

    protected IActionResult CreateResponse<T>(Result<T> result)
    {
        var response = _responseRepresenter.Represent<T>(result);

        if (result.IsSuccess)
        {
            return Ok(response);
        }

        return Ok(response);
    }
}
