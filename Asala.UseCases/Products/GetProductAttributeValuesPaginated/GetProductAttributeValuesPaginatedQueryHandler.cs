using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributeValuesPaginated;

public class GetProductAttributeValuesPaginatedQueryHandler : IRequestHandler<GetProductAttributeValuesPaginatedQuery, Result<PaginatedResult<ProductAttributeValueDto>>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributeValuesPaginatedQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<ProductAttributeValueDto>>> Handle(
        GetProductAttributeValuesPaginatedQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate pagination parameters
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1 || request.PageSize > 100) request.PageSize = 10;

            // Build query
            var query = _context.ProductAttributeValues
                .Include(v => v.ProductAttribute)
                .Include(v => v.ProductAttributeValueLocalizeds)
                .ThenInclude(l => l.Language)
                .Where(v => !v.IsDeleted);

            // Apply active filter
            if (request.ActiveOnly.HasValue)
            {
                query = query.Where(v => v.IsActive == request.ActiveOnly.Value);
            }

            // Apply attribute filter
            if (request.ProductAttributeId.HasValue)
            {
                query = query.Where(v => v.ProductAttributeId == request.ProductAttributeId.Value);
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower().Trim();
                query = query.Where(v => 
                    v.Value.ToLower().Contains(searchTerm) ||
                    v.ProductAttributeValueLocalizeds.Any(l => l.Value.ToLower().Contains(searchTerm)) ||
                    v.ProductAttribute.Name.ToLower().Contains(searchTerm)
                );
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination and ordering
            var attributeValues = await query
                .OrderBy(v => v.ProductAttribute.Name)
                .ThenBy(v => v.Value)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var attributeValueDtos = attributeValues.Select(MapToDto).ToList();

            var paginatedResult = new PaginatedResult<ProductAttributeValueDto>(
                attributeValueDtos,
                totalCount,
                request.Page,
                request.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<ProductAttributeValueDto>>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private static ProductAttributeValueDto MapToDto(Core.Modules.Products.Models.ProductAttributeValue attributeValue)
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
                .ToList()
        };
    }
}
