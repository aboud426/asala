using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IPermissionRepository : IRepository<Permission, int>
{
    // Add custom methods here if needed
}
