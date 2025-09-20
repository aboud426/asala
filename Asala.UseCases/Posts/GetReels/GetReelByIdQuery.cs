using Asala.Core.Common.Models;
using Asala.UseCases.Posts.CreateReel;
using MediatR;

namespace Asala.UseCases.Posts.GetReels;

public class GetReelByIdQuery : IRequest<Result<ReelDto>>
{
    public long Id { get; set; }
}
