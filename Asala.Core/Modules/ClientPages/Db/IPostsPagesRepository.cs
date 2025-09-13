using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IPostsPagesRepository : IRepository<PostsPages, int>
{
    Task<IEnumerable<PostsPages>> GetAllWithLocalizationsAsync();
    Task<PostsPages?> GetByIdWithLocalizationsAsync(int id);
    Task<PostsPages?> GetByKeyAsync(string key);
    Task<PostsPages?> GetByKeyWithLocalizationsAsync(string key);
}
