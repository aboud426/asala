using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.DeleteProductAttributeValue;

public class DeleteProductAttributeValueCommand : IRequest<Result>
{
    public int Id { get; set; }
}
