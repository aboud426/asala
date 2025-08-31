using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public class PermissionRepository : Repository<Permission, int>, IPermissionRepository
{
    public PermissionRepository(AsalaDbContext context) : base(context)
    {
    }
}
