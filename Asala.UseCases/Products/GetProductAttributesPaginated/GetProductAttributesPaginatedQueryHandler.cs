using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Products.GetProductAttributesPaginated;

public class GetProductAttributesPaginatedQueryHandler : IRequestHandler<GetProductAttributesPaginatedQuery, Result<PaginatedResult<ProductAttributeDto>>>
{
    private readonly AsalaDbContext _context;

    public GetProductAttributesPaginatedQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<ProductAttributeDto>>> Handle(
        GetProductAttributesPaginatedQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate pagination parameters
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1 || request.PageSize > 100) request.PageSize = 10;

            // Build query
            var query = _context.ProductAttributes
                .Include(a => a.ProductAttributeLocalizeds)
                .ThenInclude(l => l.Language)
                .Include(a => a.ProductAttributeValues)
                .Where(a => !a.IsDeleted);

            // Apply active filter
            if (request.ActiveOnly.HasValue)
            {
                query = query.Where(a => a.IsActive == request.ActiveOnly.Value);
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower().Trim();
                query = query.Where(a => 
                    a.Name.ToLower().Contains(searchTerm) ||
                    a.ProductAttributeLocalizeds.Any(l => l.Name.ToLower().Contains(searchTerm))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination and ordering
            var attributes = await query
                .OrderBy(a => a.Name)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var attributeDtos = attributes.Select(MapToDto).ToList();

            var paginatedResult = new PaginatedResult<ProductAttributeDto>(
                attributeDtos,
                totalCount,
                request.Page,
                request.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<ProductAttributeDto>>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private static ProductAttributeDto MapToDto(Core.Modules.Products.Models.ProductAttribute attribute)
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
                    Localizations = [] // Can be populated if needed
                })
                .ToList()
        };
    }
}
