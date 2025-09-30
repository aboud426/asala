using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Users.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Asala.UseCases.Products.FilterProducts;

public class FilterProductsQueryHandler : IRequestHandler<FilterProductsQuery, Result<ProductFilterResultDto>>
{
    private readonly AsalaDbContext _context;

    public FilterProductsQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductFilterResultDto>> Handle(
        FilterProductsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate pagination parameters
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1 || request.PageSize > 100) request.PageSize = 10;

            // Get language
            Language? language = null;
            if (!string.IsNullOrWhiteSpace(request.LanguageCode))
            {
                language = await _context.Languages
                    .FirstOrDefaultAsync(l => l.Code == request.LanguageCode && l.IsActive && !l.IsDeleted, cancellationToken);
            }

            // Build base query with all necessary includes
            var query = BuildBaseQuery();

            // Apply filters
            query = ApplyFilters(query, request);

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply sorting
            query = ApplySorting(query, request);

            // Apply pagination
            var products = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var productDtos = products.Select(p => MapToProductDto(p, language)).ToList();

            // Build result
            var result = new ProductFilterResultDto
            {
                Products = productDtos,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };

            // Add filter summary if requested
            if (request.IncludeFilterSummary)
            {
                result.FilterSummary = await BuildFilterSummaryAsync(request, language, cancellationToken);
            }

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProductFilterResultDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private IQueryable<Product> BuildBaseQuery()
    {
        return _context.Products
            .Include(p => p.ProductCategory)
            .Include(p => p.Provider)
            .Include(p => p.Currency)
            .Include(p => p.ProductLocalizeds.Where(pl => !pl.IsDeleted))
            .ThenInclude(pl => pl.Language)
            .Include(p => p.ProductMedias.Where(pm => !pm.IsDeleted))
            .Include(p => p.ProductAttributeAssignments.Where(paa => !paa.IsDeleted))
            .ThenInclude(paa => paa.ProductAttributeValue)
            .ThenInclude(pav => pav.ProductAttribute)
            .ThenInclude(pa => pa.ProductAttributeLocalizeds.Where(pal => !pal.IsDeleted))
            .ThenInclude(pal => pal.Language)
            .Include(p => p.ProductAttributeAssignments.Where(paa => !paa.IsDeleted))
            .ThenInclude(paa => paa.ProductAttributeValue)
            .ThenInclude(pav => pav.ProductAttributeValueLocalizeds.Where(pavl => !pavl.IsDeleted))
            .ThenInclude(pavl => pavl.Language)
            .Where(p => !p.IsDeleted);
    }

    private IQueryable<Product> ApplyFilters(IQueryable<Product> query, FilterProductsQuery request)
    {
        // Active filter
        if (request.ActiveOnly.HasValue)
        {
            query = query.Where(p => p.IsActive == request.ActiveOnly.Value);
        }

        // Search term filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower().Trim();
            query = query.Where(p => 
                p.Name.ToLower().Contains(searchTerm) ||
                (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                p.ProductLocalizeds.Any(pl => 
                    pl.NameLocalized.ToLower().Contains(searchTerm) ||
                    (pl.DescriptionLocalized != null && pl.DescriptionLocalized.ToLower().Contains(searchTerm))
                )
            );
        }

        // Category filter
        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }

        // Price range filter
        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }

        // Currency filter
        if (request.CurrencyId.HasValue)
        {
            query = query.Where(p => p.CurrencyId == request.CurrencyId.Value);
        }

        // Attribute filters
        foreach (var attributeFilter in request.AttributeFilters)
        {
            if (attributeFilter.ValueIds.Any())
            {
                query = query.Where(p => 
                    p.ProductAttributeAssignments.Any(paa => 
                        paa.ProductAttributeValue.ProductAttributeId == attributeFilter.AttributeId &&
                        attributeFilter.ValueIds.Contains(paa.ProductAttributeValueId) &&
                        paa.IsActive && !paa.IsDeleted
                    )
                );
            }
        }

        return query;
    }

    private IQueryable<Product> ApplySorting(IQueryable<Product> query, FilterProductsQuery request)
    {
        return request.SortBy switch
        {
            ProductSortBy.Name => request.SortDescending 
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
            ProductSortBy.Price => request.SortDescending 
                ? query.OrderByDescending(p => p.Price)
                : query.OrderBy(p => p.Price),
            ProductSortBy.CreatedAt => request.SortDescending 
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };
    }

    private ProductDto MapToProductDto(Product product, Language? language)
    {
        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            ProviderId = product.ProviderId,
            CategoryName = product.ProductCategory.Name,
            ProviderName = product.Provider.BusinessName,
            Price = product.Price,
            CurrencyId = product.CurrencyId,
            CurrencyName = product.Currency.Name,
            CurrencyCode = product.Currency.Code,
            CurrencySymbol = product.Currency.Symbol,
            Quantity = product.Quantity,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            Localizations = product.ProductLocalizeds
                .Where(pl => !pl.IsDeleted)
                .Select(pl => new ProductLocalizedDto
                {
                    Id = pl.Id,
                    ProductId = pl.ProductId,
                    LanguageId = pl.LanguageId,
                    LanguageCode = pl.Language.Code,
                    LanguageName = pl.Language.Name,
                    NameLocalized = pl.NameLocalized,
                    DescriptionLocalized = pl.DescriptionLocalized,
                    IsActive = pl.IsActive,
                    CreatedAt = pl.CreatedAt,
                    UpdatedAt = pl.UpdatedAt,
                })
                .ToList(),
            Images = product.ProductMedias
                .Where(pm => !pm.IsDeleted)
                .Select(pm => new ImageUrlDto { Url = pm.Url })
                .ToList(),
            AttributeAssignments = product.ProductAttributeAssignments
                .Where(paa => !paa.IsDeleted && paa.IsActive)
                .Select(paa => MapAttributeAssignmentToDto(paa, language))
                .ToList(),
        };

        // Apply localization if language is specified
        if (language != null)
        {
            var localization = product.ProductLocalizeds.FirstOrDefault(pl =>
                pl.LanguageId == language.Id && pl.IsActive && !pl.IsDeleted
            );

            if (localization != null)
            {
                dto.LocalizedName = localization.NameLocalized;
                dto.LocalizedDescription = localization.DescriptionLocalized;
            }
        }

        return dto;
    }

    private ProductAttributeAssignmentDto MapAttributeAssignmentToDto(
        ProductAttributeAssignment assignment,
        Language? language = null
    )
    {
        var dto = new ProductAttributeAssignmentDto
        {
            Id = assignment.Id,
            ProductId = assignment.ProductId,
            ProductAttributeValueId = assignment.ProductAttributeValueId,
            AttributeName = assignment.ProductAttributeValue.ProductAttribute.Name,
            AttributeValue = assignment.ProductAttributeValue.Value,
            LocalizedAttributeName = assignment.ProductAttributeValue.ProductAttribute.Name,
            LocalizedAttributeValue = assignment.ProductAttributeValue.Value,
            IsActive = assignment.IsActive
        };

        if (language != null)
        {
            // Get localized attribute name
            var attributeLocalization = assignment.ProductAttributeValue.ProductAttribute
                .ProductAttributeLocalizeds
                .FirstOrDefault(pal => pal.LanguageId == language.Id && 
                                      pal.IsActive && !pal.IsDeleted);

            if (attributeLocalization != null)
            {
                dto.LocalizedAttributeName = attributeLocalization.Name;
            }

            // Get localized attribute value
            var valueLocalization = assignment.ProductAttributeValue
                .ProductAttributeValueLocalizeds
                .FirstOrDefault(pavl => pavl.LanguageId == language.Id && 
                                       pavl.IsActive && !pavl.IsDeleted);

            if (valueLocalization != null)
            {
                dto.LocalizedAttributeValue = valueLocalization.Value;
            }
        }

        return dto;
    }

    private async Task<ProductFilterSummaryDto> BuildFilterSummaryAsync(
        FilterProductsQuery request,
        Language? language,
        CancellationToken cancellationToken
    )
    {
        var summary = new ProductFilterSummaryDto();

        // Build base query without pagination for summary
        var baseQuery = BuildBaseQuery();
        
        // Apply all filters except the ones we're summarizing
        var queryForSummary = ApplyFilters(baseQuery, new FilterProductsQuery
        {
            ActiveOnly = request.ActiveOnly,
            SearchTerm = request.SearchTerm,
            // Don't apply category, price, or attribute filters for summary
        });

        // Get available categories
        var categories = await queryForSummary
            .GroupBy(p => new { p.CategoryId, p.ProductCategory.Name })
            .Select(g => new CategoryFilterSummaryDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                LocalizedCategoryName = g.Key.Name, // TODO: Add category localization if needed
                ProductCount = g.Count()
            })
            .ToListAsync(cancellationToken);

        summary.AvailableCategories = categories;

        // Get price range
        var priceStats = await queryForSummary
            .GroupBy(p => new { p.Currency.Code, p.Currency.Symbol })
            .Select(g => new PriceRangeDto
            {
                MinPrice = g.Min(p => p.Price),
                MaxPrice = g.Max(p => p.Price),
                CurrencyCode = g.Key.Code,
                CurrencySymbol = g.Key.Symbol
            })
            .FirstOrDefaultAsync(cancellationToken);

        summary.PriceRange = priceStats ?? new PriceRangeDto();

        // Get available attributes and their values
        var attributeData = await queryForSummary
            .SelectMany(p => p.ProductAttributeAssignments)
            .Where(paa => paa.IsActive && !paa.IsDeleted)
            .GroupBy(paa => new 
            { 
                AttributeId = paa.ProductAttributeValue.ProductAttributeId,
                AttributeName = paa.ProductAttributeValue.ProductAttribute.Name,
                ValueId = paa.ProductAttributeValueId,
                ValueName = paa.ProductAttributeValue.Value
            })
            .Select(g => new
            {
                g.Key.AttributeId,
                g.Key.AttributeName,
                g.Key.ValueId,
                g.Key.ValueName,
                ProductCount = g.Select(paa => paa.ProductId).Distinct().Count()
            })
            .ToListAsync(cancellationToken);

        var attributeSummary = attributeData
            .GroupBy(a => new { a.AttributeId, a.AttributeName })
            .Select(g => new AttributeFilterSummaryDto
            {
                AttributeId = g.Key.AttributeId,
                AttributeName = g.Key.AttributeName,
                LocalizedAttributeName = g.Key.AttributeName, // Will be localized if language provided
                Values = g.Select(v => new AttributeValueFilterSummaryDto
                {
                    ValueId = v.ValueId,
                    Value = v.ValueName,
                    LocalizedValue = v.ValueName, // Will be localized if language provided
                    ProductCount = v.ProductCount
                }).ToList()
            })
            .ToList();

        summary.AvailableAttributes = attributeSummary;

        return summary;
    }
}
