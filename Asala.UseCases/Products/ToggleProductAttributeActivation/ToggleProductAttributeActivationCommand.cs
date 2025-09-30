using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Products.ToggleProductAttributeActivation;

public class ToggleProductAttributeActivationCommand : IRequest<Result>
{
    public int Id { get; set; }
}
