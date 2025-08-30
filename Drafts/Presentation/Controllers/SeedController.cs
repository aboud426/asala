using Microsoft.AspNetCore.Mvc;
using Infrastructure.Services;
using Infrastructure.Common;

namespace Presentation.Controllers;

/// <summary>
/// Controller for seeding initial data
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly MessageSeedService _messageSeedService;
    private readonly ILogger<SeedController> _logger;

    public SeedController(MessageSeedService messageSeedService, ILogger<SeedController> logger)
    {
        _messageSeedService = messageSeedService;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all required data (languages, messages, and localizations)
    /// </summary>
    [HttpPost("messages")]
    public async Task<IActionResult> SeedMessages(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting message seeding process...");
            
            var result = await _messageSeedService.SeedAllDataAsync(cancellationToken);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Message seeding completed successfully");
                return Ok(new { success = true, message = "Data seeded successfully" });
            }
            
            _logger.LogError("Message seeding failed: {Error}", result.Error?.Code);
            return BadRequest(new { success = false, error = result.Error?.Code, message = "Seeding failed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during message seeding");
            return StatusCode(500, new { success = false, error = "INTERNAL_ERROR", message = "Internal server error during seeding" });
        }
    }
} 