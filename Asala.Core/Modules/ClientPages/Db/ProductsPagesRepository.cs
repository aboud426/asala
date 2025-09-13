using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.ClientPages.Db;

public class ProductsPagesRepository : Repository<ProductsPages, int>, IProductsPagesRepository
{
    public ProductsPagesRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<IEnumerable<ProductsPages>> GetAllWithLocalizationsAsync()
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<ProductsPages?> GetByIdWithLocalizationsAsync(int id)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
    }

    public async Task<ProductsPages?> GetByKeyAsync(string key)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }

    public async Task<ProductsPages?> GetByKeyWithLocalizationsAsync(string key)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }
}
