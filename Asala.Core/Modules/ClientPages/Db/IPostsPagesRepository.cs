using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IPostsPagesRepository : IRepository<PostsPages, int>
{
    Task<IEnumerable<PostsPages>> GetAllWithLocalizationsAsync();
    Task<PostsPages?> GetByIdWithLocalizationsAsync(int id);
    Task<PostsPages?> GetByKeyAsync(string key);
    Task<PostsPages?> GetByKeyWithLocalizationsAsync(string key);

    // Methods with included types
    Task<IEnumerable<PostsPages>> GetAllWithLocalizationsAndIncludedTypesAsync();
    Task<PostsPages?> GetByIdWithLocalizationsAndIncludedTypesAsync(int id);
    Task<PostsPages?> GetByKeyWithLocalizationsAndIncludedTypesAsync(string key);

    // Methods to manage included types
    Task AddIncludedPostTypesAsync(int postsPagesId, IEnumerable<int> postTypeIds);
    Task UpdateIncludedPostTypesAsync(int postsPagesId, IEnumerable<int> postTypeIds);
    Task RemoveIncludedPostTypesAsync(int postsPagesId);
}
