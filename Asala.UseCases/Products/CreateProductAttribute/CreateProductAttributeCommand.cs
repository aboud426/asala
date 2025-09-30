using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.CreateProductAttribute;

public class CreateProductAttributeCommand : IRequest<Result<ProductAttributeDto>>
{
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public List<CreateProductAttributeLocalizedDto> Localizations { get; set; } = [];
}
