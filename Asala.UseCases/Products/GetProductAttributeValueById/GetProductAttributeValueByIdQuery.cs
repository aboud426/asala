using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.GetProductAttributeValueById;

public class GetProductAttributeValueByIdQuery : IRequest<Result<ProductAttributeValueDto>>
{
    public int Id { get; set; }
    public bool IncludeInactive { get; set; } = false;
}
