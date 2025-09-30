using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.CreateProductAttributeValue;

public class CreateProductAttributeValueCommand : IRequest<Result<ProductAttributeValueDto>>
{
    public int ProductAttributeId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public List<CreateProductAttributeValueLocalizedDto> Localizations { get; set; } = [];
}
