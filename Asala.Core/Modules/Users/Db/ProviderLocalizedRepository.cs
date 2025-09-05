using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public class ProviderLocalizedRepository : Repository<ProviderLocalized, int>, IProviderLocalizedRepository
{
    public ProviderLocalizedRepository(AsalaDbContext context)
        : base(context) { }
}
