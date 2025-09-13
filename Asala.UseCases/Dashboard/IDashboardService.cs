using Asala.Core.Common.Models;
using Asala.Core.Modules.Dashboard.DTOs;

namespace Asala.UseCases.Dashboard;

public interface IDashboardService
{
    Task<Result<DashboardStatsDto>> GetDashboardStatsAsync(
        CancellationToken cancellationToken = default
    );
}
