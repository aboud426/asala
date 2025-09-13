using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IProductsPagesRepository : IRepository<ProductsPages, int>
{
    Task<IEnumerable<ProductsPages>> GetAllWithLocalizationsAsync();
    Task<ProductsPages?> GetByIdWithLocalizationsAsync(int id);
    Task<ProductsPages?> GetByKeyAsync(string key);
    Task<ProductsPages?> GetByKeyWithLocalizationsAsync(string key);
}
