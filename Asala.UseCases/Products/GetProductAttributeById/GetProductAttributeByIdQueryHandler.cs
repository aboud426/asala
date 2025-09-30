using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributeById;

public class GetProductAttributeByIdQueryHandler : IRequestHandler<GetProductAttributeByIdQuery, Result<ProductAttributeDto>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributeByIdQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeDto>> Handle(
        GetProductAttributeByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate ID
            if (request.Id <= 0)
            {
                return Result.Failure<ProductAttributeDto>("Invalid product attribute ID");
            }

            // Build query
            var query = _context.ProductAttributes
                .Include(a => a.ProductAttributeLocalizeds)
                .ThenInclude(l => l.Language)
                .Include(a => a.ProductAttributeValues)
                .ThenInclude(v => v.ProductAttributeValueLocalizeds)
                .ThenInclude(vl => vl.Language)
                .Where(a => a.Id == request.Id && !a.IsDeleted);

            // Apply active filter unless including inactive is requested
            if (!request.IncludeInactive)
            {
                query = query.Where(a => a.IsActive);
            }

            // Get the attribute
            var attribute = await query.FirstOrDefaultAsync(cancellationToken);

            if (attribute == null)
            {
                return Result.Failure<ProductAttributeDto>("Product attribute not found");
            }

            // Map to DTO
            var attributeDto = MapToDetailedDto(attribute);

            return Result.Success(attributeDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private static ProductAttributeDto MapToDetailedDto(Core.Modules.Products.Models.ProductAttribute attribute)
    {
        return new ProductAttributeDto
        {
            Id = attribute.Id,
            Name = attribute.Name,
            IsActive = attribute.IsActive,
            CreatedAt = attribute.CreatedAt,
            UpdatedAt = attribute.UpdatedAt,
            Localizations = attribute.ProductAttributeLocalizeds
                .Where(l => !l.IsDeleted)
                .Select(l => new ProductAttributeLocalizedDto
                {
                    Id = l.Id,
                    ProductAttributeId = l.ProductAttributeId,
                    LanguageId = l.LanguageId,
                    LanguageCode = l.Language.Code,
                    LanguageName = l.Language.Name,
                    Name = l.Name,
                    IsActive = l.IsActive
                })
                .OrderBy(l => l.LanguageName)
                .ToList(),
            Values = attribute.ProductAttributeValues
                .Where(v => !v.IsDeleted)
                .Select(v => new ProductAttributeValueDto
                {
                    Id = v.Id,
                    ProductAttributeId = v.ProductAttributeId,
                    Value = v.Value,
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.UpdatedAt,
                    Localizations = v.ProductAttributeValueLocalizeds
                        .Where(vl => !vl.IsDeleted)
                        .Select(vl => new ProductAttributeValueLocalizedDto
                        {
                            Id = vl.Id,
                            ProductAttributeValueId = vl.ProductAttributeValueId,
                            LanguageId = vl.LanguageId,
                            LanguageCode = vl.Language.Code,
                            LanguageName = vl.Language.Name,
                            Value = vl.Value,
                            IsActive = vl.IsActive
                        })
                        .OrderBy(vl => vl.LanguageName)
                        .ToList()
                })
                .OrderBy(v => v.Value)
                .ToList()
        };
    }
}
