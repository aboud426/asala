using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public class PostMediaRepository : Repository<PostMedia, int>, IPostMediaRepository
{
    public PostMediaRepository(AsalaDbContext context) : base(context)
    {
    }
}
