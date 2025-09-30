using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.AddProductAttributeValueLocalization;

public class AddProductAttributeValueLocalizationCommand : IRequest<Result<ProductAttributeValueLocalizedDto>>
{
    public int ProductAttributeValueId { get; set; }
    public int LanguageId { get; set; }
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
