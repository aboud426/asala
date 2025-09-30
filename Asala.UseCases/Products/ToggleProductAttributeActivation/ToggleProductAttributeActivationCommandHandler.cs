using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.ToggleProductAttributeActivation;

public class ToggleProductAttributeActivationCommandHandler : IRequestHandler<ToggleProductAttributeActivationCommand, Result>
{
    private readonly AsalaDbContext _context;

    public ToggleProductAttributeActivationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        ToggleProductAttributeActivationCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            if (request.Id <= 0)
            {
                return Result.Failure("Invalid product attribute ID");
            }

            // Find the product attribute
            var productAttribute = await _context.ProductAttributes
                .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

            if (productAttribute == null)
            {
                return Result.Failure("Product attribute not found");
            }

            // Toggle activation status
            productAttribute.IsActive = !productAttribute.IsActive;
            productAttribute.UpdatedAt = DateTime.UtcNow;

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
