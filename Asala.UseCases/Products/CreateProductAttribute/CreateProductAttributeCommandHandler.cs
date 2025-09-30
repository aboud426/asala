using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.CreateProductAttribute;

public class CreateProductAttributeCommandHandler : IRequestHandler<CreateProductAttributeCommand, Result<ProductAttributeDto>>
{
    private readonly AsalaDbContext _context;

    public CreateProductAttributeCommandHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeDto>> Handle(
        CreateProductAttributeCommand request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate request
            var validationResult = await ValidateRequestAsync(request, cancellationToken);
            if (validationResult.IsFailure)
                return validationResult;

            // Create and save product attribute
            var productAttribute = CreateProductAttributeEntity(request);
            await SaveProductAttributeAsync(productAttribute, cancellationToken);

            // Save localizations if any
            if (request.Localizations.Any())
            {
                await SaveLocalizationsAsync(productAttribute.Id, request, cancellationToken);
            }

            // Retrieve and return result
            return await GetCreatedAttributeResultAsync(productAttribute.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private async Task<Result<ProductAttributeDto>> ValidateRequestAsync(
        CreateProductAttributeCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate name is provided
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result.Failure<ProductAttributeDto>("Attribute name is required");
        }

        // Check if attribute name already exists
        var existingAttribute = await _context.ProductAttributes
            .FirstOrDefaultAsync(a => a.Name.ToLower() == request.Name.ToLower().Trim() && !a.IsDeleted, cancellationToken);

        if (existingAttribute != null)
        {
            return Result.Failure<ProductAttributeDto>("Attribute with this name already exists");
        }

        // Validate languages if localizations are provided
        if (request.Localizations.Any())
        {
            var languageIds = request.Localizations.Select(l => l.LanguageId).Distinct();
            var validLanguageIds = await _context
                .Languages.Where(l => languageIds.Contains(l.Id) && l.IsActive)
                .Select(l => l.Id)
                .ToListAsync(cancellationToken);

            if (validLanguageIds.Count != languageIds.Count())
            {
                return Result.Failure<ProductAttributeDto>("One or more languages not found");
            }
        }

        return Result.Success<ProductAttributeDto>(new ProductAttributeDto { });
    }

    private static ProductAttribute CreateProductAttributeEntity(CreateProductAttributeCommand request)
    {
        return new ProductAttribute
        {
            Name = request.Name.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
    }

    private async Task SaveProductAttributeAsync(
        ProductAttribute productAttribute,
        CancellationToken cancellationToken
    )
    {
        _context.ProductAttributes.Add(productAttribute);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task SaveLocalizationsAsync(
        int attributeId,
        CreateProductAttributeCommand request,
        CancellationToken cancellationToken
    )
    {
        var localizations = request
            .Localizations.Select(l => new ProductAttributeLocalized
            {
                ProductAttributeId = attributeId,
                LanguageId = l.LanguageId,
                Name = l.Name.Trim(),
                IsActive = l.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            })
            .ToList();

        _context.ProductAttributeLocalizeds.AddRange(localizations);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Result<ProductAttributeDto>> GetCreatedAttributeResultAsync(
        int attributeId,
        CancellationToken cancellationToken
    )
    {
        var attribute = await _context
            .ProductAttributes
            .Include(a => a.ProductAttributeLocalizeds)
            .ThenInclude(l => l.Language)
            .FirstOrDefaultAsync(a => a.Id == attributeId, cancellationToken);

        if (attribute == null)
            return Result.Failure<ProductAttributeDto>("Attribute not found after creation");

        return Result.Success(MapToDto(attribute));
    }

    private static ProductAttributeDto MapToDto(ProductAttribute attribute)
    {
        return new ProductAttributeDto
        {
            Id = attribute.Id,
            Name = attribute.Name,
            IsActive = attribute.IsActive,
            CreatedAt = attribute.CreatedAt,
            UpdatedAt = attribute.UpdatedAt,
            Localizations = attribute
                .ProductAttributeLocalizeds.Select(l => new ProductAttributeLocalizedDto
                {
                    Id = l.Id,
                    ProductAttributeId = l.ProductAttributeId,
                    LanguageId = l.LanguageId,
                    LanguageCode = l.Language.Code,
                    LanguageName = l.Language.Name,
                    Name = l.Name,
                    IsActive = l.IsActive,
                })
                .ToList(),
            Values = [] // Will be populated when values are added
        };
    }
}
