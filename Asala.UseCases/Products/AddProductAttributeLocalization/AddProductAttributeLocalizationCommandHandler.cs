using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.AddProductAttributeLocalization;

public class AddProductAttributeLocalizationCommandHandler : IRequestHandler<AddProductAttributeLocalizationCommand, Result<ProductAttributeLocalizedDto>>
{
    private readonly AsalaDbContext _context;

    public AddProductAttributeLocalizationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeLocalizedDto>> Handle(
        AddProductAttributeLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return validationResult;

            // Create localization
            var localization = new ProductAttributeLocalized
            {
                ProductAttributeId = request.ProductAttributeId,
                LanguageId = request.LanguageId,
                Name = request.Name.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ProductAttributeLocalizeds.Add(localization);
            await _context.SaveChangesAsync(cancellationToken);

            // Return the created localization with language details
            return await GetCreatedLocalizationResultAsync(localization.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeLocalizedDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result<ProductAttributeLocalizedDto>> ValidateRequestAsync(
        AddProductAttributeLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate name is provided
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result.Failure<ProductAttributeLocalizedDto>("Localized name is required");
        }

        // Validate ProductAttribute exists
        var attributeExists = await _context.ProductAttributes
            .AnyAsync(a => a.Id == request.ProductAttributeId && !a.IsDeleted, cancellationToken);

        if (!attributeExists)
        {
            return Result.Failure<ProductAttributeLocalizedDto>("Product attribute not found");
        }

        // Validate Language exists
        var languageExists = await _context.Languages
            .AnyAsync(l => l.Id == request.LanguageId && l.IsActive, cancellationToken);

        if (!languageExists)
        {
            return Result.Failure<ProductAttributeLocalizedDto>("Language not found");
        }

        // Check if localization already exists for this attribute and language
        var existingLocalization = await _context.ProductAttributeLocalizeds
            .AnyAsync(l => l.ProductAttributeId == request.ProductAttributeId && 
                          l.LanguageId == request.LanguageId && 
                          !l.IsDeleted, cancellationToken);

        if (existingLocalization)
        {
            return Result.Failure<ProductAttributeLocalizedDto>("Localization already exists for this language");
        }

        return Result.Success<ProductAttributeLocalizedDto>(new ProductAttributeLocalizedDto { });
    }

    private async Task<Result<ProductAttributeLocalizedDto>> GetCreatedLocalizationResultAsync(
        int localizationId,
        CancellationToken cancellationToken
    )
    {
        var localization = await _context.ProductAttributeLocalizeds
            .Include(l => l.Language)
            .FirstOrDefaultAsync(l => l.Id == localizationId, cancellationToken);

        if (localization == null)
            return Result.Failure<ProductAttributeLocalizedDto>("Localization not found after creation");

        var dto = new ProductAttributeLocalizedDto
        {
            Id = localization.Id,
            ProductAttributeId = localization.ProductAttributeId,
            LanguageId = localization.LanguageId,
            LanguageCode = localization.Language.Code,
            LanguageName = localization.Language.Name,
            Name = localization.Name,
            IsActive = localization.IsActive
        };

        return Result.Success(dto);
    }
}
