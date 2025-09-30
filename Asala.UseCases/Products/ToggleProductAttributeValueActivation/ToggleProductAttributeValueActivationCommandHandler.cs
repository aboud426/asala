using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.ToggleProductAttributeValueActivation;

public class ToggleProductAttributeValueActivationCommandHandler : IRequestHandler<ToggleProductAttributeValueActivationCommand, Result>
{
    private readonly AsalaDbContext _context;

    public ToggleProductAttributeValueActivationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        ToggleProductAttributeValueActivationCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            if (request.Id <= 0)
            {
                return Result.Failure("Invalid product attribute value ID");
            }

            // Find the product attribute value
            var attributeValue = await _context.ProductAttributeValues
                .FirstOrDefaultAsync(v => v.Id == request.Id && !v.IsDeleted, cancellationToken);

            if (attributeValue == null)
            {
                return Result.Failure("Product attribute value not found");
            }

            // Toggle activation status
            attributeValue.IsActive = !attributeValue.IsActive;
            attributeValue.UpdatedAt = DateTime.UtcNow;

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
