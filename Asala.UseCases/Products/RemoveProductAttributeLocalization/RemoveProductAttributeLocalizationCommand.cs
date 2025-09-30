using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.RemoveProductAttributeLocalization;

public class RemoveProductAttributeLocalizationCommand : IRequest<Result>
{
    public int ProductAttributeId { get; set; }
    public int LanguageId { get; set; }
}
