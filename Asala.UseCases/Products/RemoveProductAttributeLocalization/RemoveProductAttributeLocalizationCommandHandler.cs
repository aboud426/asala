using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.RemoveProductAttributeLocalization;

public class RemoveProductAttributeLocalizationCommandHandler : IRequestHandler<RemoveProductAttributeLocalizationCommand, Result>
{
    private readonly AsalaDbContext _context;

    public RemoveProductAttributeLocalizationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        RemoveProductAttributeLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return validationResult;

            // Find the localization
            var localization = await _context.ProductAttributeLocalizeds
                .FirstOrDefaultAsync(l => l.ProductAttributeId == request.ProductAttributeId && 
                                         l.LanguageId == request.LanguageId && 
                                         !l.IsDeleted, cancellationToken);

            if (localization == null)
            {
                return Result.Failure("Localization not found");
            }

            // Check if this is the last localization for the attribute
            var localizationCount = await _context.ProductAttributeLocalizeds
                .CountAsync(l => l.ProductAttributeId == request.ProductAttributeId && 
                                !l.IsDeleted, cancellationToken);

            if (localizationCount <= 1)
            {
                return Result.Failure("Cannot remove the last localization. Attribute must have at least one localization.");
            }

            // Soft delete the localization
            localization.IsDeleted = true;
            localization.IsActive = false;
            localization.DeletedAt = DateTime.UtcNow;
            localization.UpdatedAt = DateTime.UtcNow;

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result> ValidateRequestAsync(
        RemoveProductAttributeLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate ProductAttribute exists
        var attributeExists = await _context.ProductAttributes
            .AnyAsync(a => a.Id == request.ProductAttributeId && !a.IsDeleted, cancellationToken);

        if (!attributeExists)
        {
            return Result.Failure("Product attribute not found");
        }

        // Validate Language exists
        var languageExists = await _context.Languages
            .AnyAsync(l => l.Id == request.LanguageId && l.IsActive, cancellationToken);

        if (!languageExists)
        {
            return Result.Failure("Language not found");
        }

        return Result.Success();
    }
}
