using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IProductsPagesRepository : IRepository<ProductsPages, int>
{
    Task<IEnumerable<ProductsPages>> GetAllWithLocalizationsAsync();
    Task<ProductsPages?> GetByIdWithLocalizationsAsync(int id);
    Task<ProductsPages?> GetByKeyAsync(string key);
    Task<ProductsPages?> GetByKeyWithLocalizationsAsync(string key);

    // Methods with included types
    Task<IEnumerable<ProductsPages>> GetAllWithLocalizationsAndIncludedTypesAsync();
    Task<ProductsPages?> GetByIdWithLocalizationsAndIncludedTypesAsync(int id);
    Task<ProductsPages?> GetByKeyWithLocalizationsAndIncludedTypesAsync(string key);

    // Methods to manage included types
    Task AddIncludedProductTypesAsync(int productsPagesId, IEnumerable<int> productCategoryIds);
    Task UpdateIncludedProductTypesAsync(int productsPagesId, IEnumerable<int> productCategoryIds);
    Task RemoveIncludedProductTypesAsync(int productsPagesId);
}
