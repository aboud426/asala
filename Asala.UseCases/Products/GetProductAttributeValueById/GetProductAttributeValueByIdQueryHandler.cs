using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributeValueById;

public class GetProductAttributeValueByIdQueryHandler : IRequestHandler<GetProductAttributeValueByIdQuery, Result<ProductAttributeValueDto>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributeValueByIdQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductAttributeValueDto>> Handle(
        GetProductAttributeValueByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate ID
            if (request.Id <= 0)
            {
                return Result.Failure<ProductAttributeValueDto>("Invalid product attribute value ID");
            }

            // Build query
            var query = _context.ProductAttributeValues
                .Include(v => v.ProductAttribute)
                .Include(v => v.ProductAttributeValueLocalizeds)
                .ThenInclude(l => l.Language)
                .Where(v => v.Id == request.Id && !v.IsDeleted);

            // Apply active filter unless including inactive is requested
            if (!request.IncludeInactive)
            {
                query = query.Where(v => v.IsActive);
            }

            // Get the attribute value
            var attributeValue = await query.FirstOrDefaultAsync(cancellationToken);

            if (attributeValue == null)
            {
                return Result.Failure<ProductAttributeValueDto>("Product attribute value not found");
            }

            // Map to DTO
            var attributeValueDto = MapToDetailedDto(attributeValue);

            return Result.Success(attributeValueDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductAttributeValueDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private static ProductAttributeValueDto MapToDetailedDto(Core.Modules.Products.Models.ProductAttributeValue attributeValue)
    {
        return new ProductAttributeValueDto
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
                .OrderBy(l => l.LanguageName)
                .ToList()
        };
    }
}
