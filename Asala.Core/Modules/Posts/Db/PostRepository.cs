using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public class PostRepository : Repository<Post, int>, IPostRepository
{
    public PostRepository(AsalaDbContext context) : base(context)
    {
    }
}
