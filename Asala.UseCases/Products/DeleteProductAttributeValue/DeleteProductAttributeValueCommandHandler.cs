using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.DeleteProductAttributeValue;

public class DeleteProductAttributeValueCommandHandler : IRequestHandler<DeleteProductAttributeValueCommand, Result>
{
    private readonly AsalaDbContext _context;

    public DeleteProductAttributeValueCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        DeleteProductAttributeValueCommand request,
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

            // Check if value is being used by any products
            var isValueInUse = await _context.ProductAttributeAssignments
                .AnyAsync(pa => pa.ProductAttributeValueId == request.Id && 
                               !pa.IsDeleted, cancellationToken);

            if (isValueInUse)
            {
                return Result.Failure("Cannot delete attribute value that is currently assigned to products");
            }

            // Soft delete the attribute value and all its localizations
            attributeValue.IsDeleted = true;
            attributeValue.IsActive = false;
            attributeValue.DeletedAt = DateTime.UtcNow;
            attributeValue.UpdatedAt = DateTime.UtcNow;

            // Soft delete all value localizations
            var localizations = await _context.ProductAttributeValueLocalizeds
                .Where(l => l.ProductAttributeValueId == request.Id && !l.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var localization in localizations)
            {
                localization.IsDeleted = true;
                localization.IsActive = false;
                localization.DeletedAt = DateTime.UtcNow;
                localization.UpdatedAt = DateTime.UtcNow;
            }

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
