using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.RemoveProductAttributeValueLocalization;

public class RemoveProductAttributeValueLocalizationCommand : IRequest<Result>
{
    public int ProductAttributeValueId { get; set; }
    public int LanguageId { get; set; }
}
