using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributesDropdown;

public class GetProductAttributesDropdownQueryHandler : IRequestHandler<GetProductAttributesDropdownQuery, Result<List<ProductAttributeDropdownDto>>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributesDropdownQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ProductAttributeDropdownDto>>> Handle(
        GetProductAttributesDropdownQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Build query
            var query = _context.ProductAttributes
                .Include(a => a.ProductAttributeLocalizeds)
                .ThenInclude(l => l.Language)
                .Where(a => !a.IsDeleted);

            // Apply active filter
            if (request.ActiveOnly)
            {
                query = query.Where(a => a.IsActive);
            }

            // Get attributes
            var attributes = await query
                .OrderBy(a => a.Name)
                .ToListAsync(cancellationToken);

            // Map to dropdown DTOs
            var dropdownItems = attributes.Select(attribute =>
            {
                var localizedName = attribute.Name; // Default to original name

                // If language is specified, try to get localized name
                if (request.LanguageId.HasValue)
                {
                    var localization = attribute.ProductAttributeLocalizeds
                        .FirstOrDefault(l => l.LanguageId == request.LanguageId.Value && 
                                           !l.IsDeleted && 
                                           l.IsActive);
                    
                    if (localization != null)
                    {
                        localizedName = localization.Name;
                    }
                }

                return new ProductAttributeDropdownDto
                {
                    Id = attribute.Id,
                    Name = attribute.Name,
                    LocalizedName = localizedName
                };
            }).ToList();

            return Result.Success(dropdownItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<ProductAttributeDropdownDto>>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }
}
