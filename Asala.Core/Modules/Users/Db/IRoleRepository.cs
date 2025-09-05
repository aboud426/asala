using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IRoleRepository : IRepository<Role, int>
{
    Task<Result<Role?>> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Result<bool>> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
}
