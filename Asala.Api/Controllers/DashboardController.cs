using Asala.UseCases.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Dashboard controller for retrieving dashboard statistics and analytics data
/// </summary>
[ApiController]
[Route("api/dashboard")]
public class DashboardController : BaseController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
        : base()
    {
        _dashboardService =
            dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken = default)
    {
        var result = await _dashboardService.GetDashboardStatsAsync(cancellationToken);
        return CreateResponse(result);
    }
}
