using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.CreateProductAttributeValue;

public class CreateProductAttributeValueCommandHandler : IRequestHandler<CreateProductAttributeValueCommand, Result<ProductAttributeValueDto>>
{
    private readonly AsalaDbContext _context;

    public CreateProductAttributeValueCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeValueDto>> Handle(
        CreateProductAttributeValueCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return validationResult;

            // Create the attribute value
            var attributeValue = new ProductAttributeValue
            {
                ProductAttributeId = request.ProductAttributeId,
                Value = request.Value.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ProductAttributeValues.Add(attributeValue);
            await _context.SaveChangesAsync(cancellationToken);

            // Create localizations if provided
            if (request.Localizations.Any())
            {
                var localizations = new List<ProductAttributeValueLocalized>();

                foreach (var localizationDto in request.Localizations)
                {
                    var localization = new ProductAttributeValueLocalized
                    {
                        ProductAttributeValueId = attributeValue.Id,
                        LanguageId = localizationDto.LanguageId,
                        Value = localizationDto.Value.Trim(),
                        IsActive = localizationDto.IsActive,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    localizations.Add(localization);
                }

                _context.ProductAttributeValueLocalizeds.AddRange(localizations);
                await _context.SaveChangesAsync(cancellationToken);
            }

            // Return the created attribute value with details
            return await GetCreatedAttributeValueResultAsync(attributeValue.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeValueDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result<ProductAttributeValueDto>> ValidateRequestAsync(
        CreateProductAttributeValueCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate value is provided
        if (string.IsNullOrWhiteSpace(request.Value))
        {
            return Result.Failure<ProductAttributeValueDto>("Value is required");
        }

        // Validate ProductAttribute exists
        var attributeExists = await _context.ProductAttributes
            .AnyAsync(a => a.Id == request.ProductAttributeId && !a.IsDeleted, cancellationToken);

        if (!attributeExists)
        {
            return Result.Failure<ProductAttributeValueDto>("Product attribute not found");
        }

        // Check if value already exists for this attribute
        var existingValue = await _context.ProductAttributeValues
            .AnyAsync(v => v.ProductAttributeId == request.ProductAttributeId && 
                          v.Value.ToLower() == request.Value.ToLower().Trim() && 
                          !v.IsDeleted, cancellationToken);

        if (existingValue)
        {
            return Result.Failure<ProductAttributeValueDto>("Value already exists for this attribute");
        }

        // Validate localizations
        if (request.Localizations.Any())
        {
            var languageIds = request.Localizations.Select(l => l.LanguageId).ToList();
            var existingLanguages = await _context.Languages
                .Where(l => languageIds.Contains(l.Id) && l.IsActive)
                .Select(l => l.Id)
                .ToListAsync(cancellationToken);

            var invalidLanguageIds = languageIds.Except(existingLanguages).ToList();
            if (invalidLanguageIds.Any())
            {
                return Result.Failure<ProductAttributeValueDto>($"Invalid language IDs: {string.Join(", ", invalidLanguageIds)}");
            }

            // Check for duplicate language IDs in request
            var duplicateLanguages = request.Localizations
                .GroupBy(l => l.LanguageId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateLanguages.Any())
            {
                return Result.Failure<ProductAttributeValueDto>($"Duplicate language IDs: {string.Join(", ", duplicateLanguages)}");
            }
        }

        return Result.Success<ProductAttributeValueDto>(new ProductAttributeValueDto { });
    }

    private async Task<Result<ProductAttributeValueDto>> GetCreatedAttributeValueResultAsync(
        int attributeValueId,
        CancellationToken cancellationToken
    )
    {
        var attributeValue = await _context.ProductAttributeValues
            .Include(v => v.ProductAttributeValueLocalizeds)
            .ThenInclude(vl => vl.Language)
            .FirstOrDefaultAsync(v => v.Id == attributeValueId, cancellationToken);

        if (attributeValue == null)
            return Result.Failure<ProductAttributeValueDto>("Attribute value not found after creation");

        var dto = new ProductAttributeValueDto
        {
            Id = attributeValue.Id,
            ProductAttributeId = attributeValue.ProductAttributeId,
            Value = attributeValue.Value,
            IsActive = attributeValue.IsActive,
            CreatedAt = attributeValue.CreatedAt,
            UpdatedAt = attributeValue.UpdatedAt,
            Localizations = attributeValue.ProductAttributeValueLocalizeds
                .Where(l => !l.IsDeleted)
                .Select(l => new ProductAttributeValueLocalizedDto
                {
                    Id = l.Id,
                    ProductAttributeValueId = l.ProductAttributeValueId,
                    LanguageId = l.LanguageId,
                    LanguageCode = l.Language.Code,
                    LanguageName = l.Language.Name,
                    Value = l.Value,
                    IsActive = l.IsActive
                })
                .ToList()
        };

        return Result.Success(dto);
    }
}
