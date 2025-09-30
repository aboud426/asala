using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.AddProductAttributeLocalization;

public class AddProductAttributeLocalizationCommand : IRequest<Result<ProductAttributeLocalizedDto>>
{
    public int ProductAttributeId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
