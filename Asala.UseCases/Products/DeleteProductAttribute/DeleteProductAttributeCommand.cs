using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.DeleteProductAttribute;

public class DeleteProductAttributeCommand : IRequest<Result>
{
    public int Id { get; set; }
}
