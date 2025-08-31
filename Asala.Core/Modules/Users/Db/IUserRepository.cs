using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IUserRepository : IRepository<User, int>
{
    Task<Result<User?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Result<bool>> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default);
}
