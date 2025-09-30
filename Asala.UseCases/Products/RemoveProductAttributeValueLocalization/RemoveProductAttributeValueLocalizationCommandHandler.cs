using Asala.Core.Common.Models;
using Asala.Core.Db;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.RemoveProductAttributeValueLocalization;

public class RemoveProductAttributeValueLocalizationCommandHandler : IRequestHandler<RemoveProductAttributeValueLocalizationCommand, Result>
{
    private readonly AsalaDbContext _context;

    public RemoveProductAttributeValueLocalizationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        RemoveProductAttributeValueLocalizationCommand request,
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
            var localization = await _context.ProductAttributeValueLocalizeds
                .FirstOrDefaultAsync(l => l.ProductAttributeValueId == request.ProductAttributeValueId && 
                                         l.LanguageId == request.LanguageId && 
                                         !l.IsDeleted, cancellationToken);

            if (localization == null)
            {
                return Result.Failure("Localization not found");
            }

            // Soft delete the localization (no minimum requirement check for value localizations)
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
        RemoveProductAttributeValueLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate ProductAttributeValue exists
        var attributeValueExists = await _context.ProductAttributeValues
            .AnyAsync(v => v.Id == request.ProductAttributeValueId && !v.IsDeleted, cancellationToken);

        if (!attributeValueExists)
        {
            return Result.Failure("Product attribute value not found");
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
