using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.GetProductAttributeById;

public class GetProductAttributeByIdQuery : IRequest<Result<ProductAttributeDto>>
{
    public int Id { get; set; }
    public bool IncludeInactive { get; set; } = false;
}
