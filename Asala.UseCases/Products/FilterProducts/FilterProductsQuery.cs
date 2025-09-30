using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.FilterProducts;

public class FilterProductsQuery : IRequest<Result<ProductFilterResultDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? LanguageCode { get; set; } = "en";
    public bool? ActiveOnly { get; set; } = true;
    public string? SearchTerm { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? CurrencyId { get; set; }
    public List<ProductAttributeFilterDto> AttributeFilters { get; set; } = [];
    public ProductSortBy SortBy { get; set; } = ProductSortBy.CreatedAt;
    public bool SortDescending { get; set; } = true;
    public bool IncludeFilterSummary { get; set; } = false;
}
