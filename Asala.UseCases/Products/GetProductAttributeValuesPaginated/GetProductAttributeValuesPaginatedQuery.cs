using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.GetProductAttributeValuesPaginated;

public class GetProductAttributeValuesPaginatedQuery : IRequest<Result<PaginatedResult<ProductAttributeValueDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public bool? ActiveOnly { get; set; } = true;
    public string? SearchTerm { get; set; }
    public int? ProductAttributeId { get; set; }
}
