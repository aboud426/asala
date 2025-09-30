using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributeValuesDropdown;

public class GetProductAttributeValuesDropdownQueryHandler : IRequestHandler<GetProductAttributeValuesDropdownQuery, Result<List<ProductAttributeValueDropdownDto>>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributeValuesDropdownQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ProductAttributeValueDropdownDto>>> Handle(
        GetProductAttributeValuesDropdownQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Build query
            var query = _context.ProductAttributeValues
                .Include(v => v.ProductAttribute)
                .Include(v => v.ProductAttributeValueLocalizeds)
                .ThenInclude(l => l.Language)
                .Where(v => !v.IsDeleted);

            // Apply active filter
            if (request.ActiveOnly)
            {
                query = query.Where(v => v.IsActive && v.ProductAttribute.IsActive);
            }

            // Apply attribute filter
            if (request.ProductAttributeId.HasValue)
            {
                query = query.Where(v => v.ProductAttributeId == request.ProductAttributeId.Value);
            }

            // Get attribute values
            var attributeValues = await query
                .OrderBy(v => v.ProductAttribute.Name)
                .ThenBy(v => v.Value)
                .ToListAsync(cancellationToken);

            // Map to dropdown DTOs
            var dropdownItems = attributeValues.Select(attributeValue =>
            {
                var localizedValue = attributeValue.Value; // Default to original value

                // If language is specified, try to get localized value
                if (request.LanguageId.HasValue)
                {
                    var localization = attributeValue.ProductAttributeValueLocalizeds
                        .FirstOrDefault(l => l.LanguageId == request.LanguageId.Value && 
                                           !l.IsDeleted && 
                                           l.IsActive);
                    
                    if (localization != null)
                    {
                        localizedValue = localization.Value;
                    }
                }

                return new ProductAttributeValueDropdownDto
                {
                    Id = attributeValue.Id,
                    Value = attributeValue.Value,
                    LocalizedValue = localizedValue,
                    ProductAttributeId = attributeValue.ProductAttributeId,
                    ProductAttributeName = attributeValue.ProductAttribute.Name
                };
            }).ToList();

            return Result.Success(dropdownItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<ProductAttributeValueDropdownDto>>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
