using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.ToggleProductAttributeValueActivation;

public class ToggleProductAttributeValueActivationCommand : IRequest<Result>
{
    public int Id { get; set; }
}
