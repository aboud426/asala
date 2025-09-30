using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;
using MediatR;

namespace Asala.UseCases.Products.GetProductAttributeValuesDropdown;

public class GetProductAttributeValuesDropdownQuery : IRequest<Result<List<ProductAttributeValueDropdownDto>>>
{
    public bool ActiveOnly { get; set; } = true;
    public int? LanguageId { get; set; }
    public int? ProductAttributeId { get; set; }
}
