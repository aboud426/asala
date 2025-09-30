using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.GetProductAttributesDropdown;

public class GetProductAttributesDropdownQuery : IRequest<Result<List<ProductAttributeDropdownDto>>>
{
    public bool ActiveOnly { get; set; } = true;
    public int? LanguageId { get; set; }
}
