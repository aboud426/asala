using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.AddProductAttributeValueLocalization;

public class AddProductAttributeValueLocalizationCommandHandler : IRequestHandler<AddProductAttributeValueLocalizationCommand, Result<ProductAttributeValueLocalizedDto>>
{
    private readonly AsalaDbContext _context;

    public AddProductAttributeValueLocalizationCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeValueLocalizedDto>> Handle(
        AddProductAttributeValueLocalizationCommand request,
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
            var localization = new ProductAttributeValueLocalized
            {
                ProductAttributeValueId = request.ProductAttributeValueId,
                LanguageId = request.LanguageId,
                Value = request.Value.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ProductAttributeValueLocalizeds.Add(localization);
            await _context.SaveChangesAsync(cancellationToken);

            // Return the created localization with language details
            return await GetCreatedLocalizationResultAsync(localization.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeValueLocalizedDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result<ProductAttributeValueLocalizedDto>> ValidateRequestAsync(
        AddProductAttributeValueLocalizationCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate value is provided
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return Result.Failure<ProductAttributeValueLocalizedDto>("Localized value is required");
        }

        // Validate ProductAttributeValue exists
        var attributeValueExists = await _context.ProductAttributeValues
            .AnyAsync(v => v.Id == request.ProductAttributeValueId && !v.IsDeleted, cancellationToken);

        if (!attributeValueExists)
        {
            return Result.Failure<ProductAttributeValueLocalizedDto>("Product attribute value not found");
        }

        // Validate Language exists
        var languageExists = await _context.Languages
            .AnyAsync(l => l.Id == request.LanguageId && l.IsActive, cancellationToken);

        if (!languageExists)
        {
            return Result.Failure<ProductAttributeValueLocalizedDto>("Language not found");
        }

        // Check if localization already exists for this attribute value and language
        var existingLocalization = await _context.ProductAttributeValueLocalizeds
            .AnyAsync(l => l.ProductAttributeValueId == request.ProductAttributeValueId && 
                          l.LanguageId == request.LanguageId && 
                          !l.IsDeleted, cancellationToken);

        if (existingLocalization)
        {
            return Result.Failure<ProductAttributeValueLocalizedDto>("Localization already exists for this language");
        }

        return Result.Success<ProductAttributeValueLocalizedDto>(new ProductAttributeValueLocalizedDto { });
    }

    private async Task<Result<ProductAttributeValueLocalizedDto>> GetCreatedLocalizationResultAsync(
        int localizationId,
        CancellationToken cancellationToken
    )
    {
        var localization = await _context.ProductAttributeValueLocalizeds
            .Include(l => l.Language)
            .FirstOrDefaultAsync(l => l.Id == localizationId, cancellationToken);

        if (localization == null)
            return Result.Failure<ProductAttributeValueLocalizedDto>("Localization not found after creation");

        var dto = new ProductAttributeValueLocalizedDto
        {
            Id = localization.Id,
            ProductAttributeValueId = localization.ProductAttributeValueId,
            LanguageId = localization.LanguageId,
            LanguageCode = localization.Language.Code,
            LanguageName = localization.Language.Name,
            Value = localization.Value,
            IsActive = localization.IsActive
        };

        return Result.Success(dto);
    }
}
