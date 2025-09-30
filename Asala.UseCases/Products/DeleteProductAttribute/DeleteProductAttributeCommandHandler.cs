using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.DeleteProductAttribute;

public class DeleteProductAttributeCommandHandler : IRequestHandler<DeleteProductAttributeCommand, Result>
{
    private readonly AsalaDbContext _context;

    public DeleteProductAttributeCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        DeleteProductAttributeCommand request,
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

            // Check if attribute is being used by any products
            var isAttributeInUse = await _context.ProductAttributeAssignments
                .AnyAsync(pa => pa.ProductAttributeValue.ProductAttributeId == request.Id && 
                               !pa.IsDeleted, cancellationToken);

            if (isAttributeInUse)
            {
                return Result.Failure("Cannot delete attribute that is currently assigned to products");
            }

            // Soft delete the attribute and all its related data
            productAttribute.IsDeleted = true;
            productAttribute.IsActive = false;
            productAttribute.DeletedAt = DateTime.UtcNow;
            productAttribute.UpdatedAt = DateTime.UtcNow;

            // Soft delete all localizations
            var localizations = await _context.ProductAttributeLocalizeds
                .Where(l => l.ProductAttributeId == request.Id && !l.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var localization in localizations)
            {
                localization.IsDeleted = true;
                localization.IsActive = false;
                localization.DeletedAt = DateTime.UtcNow;
                localization.UpdatedAt = DateTime.UtcNow;
            }

            // Soft delete all attribute values
            var attributeValues = await _context.ProductAttributeValues
                .Where(v => v.ProductAttributeId == request.Id && !v.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var value in attributeValues)
            {
                value.IsDeleted = true;
                value.IsActive = false;
                value.DeletedAt = DateTime.UtcNow;
                value.UpdatedAt = DateTime.UtcNow;

                // Soft delete value localizations
                var valueLocalizations = await _context.ProductAttributeValueLocalizeds
                    .Where(vl => vl.ProductAttributeValueId == value.Id && !vl.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var valueLocalization in valueLocalizations)
                {
                    valueLocalization.IsDeleted = true;
                    valueLocalization.IsActive = false;
                    valueLocalization.DeletedAt = DateTime.UtcNow;
                    valueLocalization.UpdatedAt = DateTime.UtcNow;
                }
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
