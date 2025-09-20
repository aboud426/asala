using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public class PostLocalizedRepository : Repository<PostLocalized, int>, IPostLocalizedRepository
{
    public PostLocalizedRepository(AsalaDbContext context) : base(context)
    {
    }
}
