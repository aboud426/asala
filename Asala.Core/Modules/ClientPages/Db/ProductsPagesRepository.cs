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

    public async Task<IEnumerable<ProductsPages>> GetAllWithLocalizationsAndIncludedTypesAsync()
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedProductTypes)
            .ThenInclude(i => i.ProductCategory)
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<ProductsPages?> GetByIdWithLocalizationsAndIncludedTypesAsync(int id)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedProductTypes)
            .ThenInclude(i => i.ProductCategory)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
    }

    public async Task<ProductsPages?> GetByKeyWithLocalizationsAndIncludedTypesAsync(string key)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedProductTypes)
            .ThenInclude(i => i.ProductCategory)
            .FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }

    public async Task AddIncludedProductTypesAsync(
        int productsPagesId,
        IEnumerable<int> productCategoryIds
    )
    {
        var includedProductTypes = productCategoryIds.Select(categoryId => new IncludedProductType
        {
            ProductsPagesId = productsPagesId,
            ProductCategoryId = categoryId,
        });

        await _context.Set<IncludedProductType>().AddRangeAsync(includedProductTypes);
    }

    public async Task UpdateIncludedProductTypesAsync(
        int productsPagesId,
        IEnumerable<int> productCategoryIds
    )
    {
        // Remove existing included types
        await RemoveIncludedProductTypesAsync(productsPagesId);

        // Add new included types
        if (productCategoryIds.Any())
        {
            await AddIncludedProductTypesAsync(productsPagesId, productCategoryIds);
        }
    }

    public async Task RemoveIncludedProductTypesAsync(int productsPagesId)
    {
        var existingIncludedTypes = await _context
            .Set<IncludedProductType>()
            .Where(x => x.ProductsPagesId == productsPagesId)
            .ToListAsync();

        if (existingIncludedTypes.Any())
        {
            _context.Set<IncludedProductType>().RemoveRange(existingIncludedTypes);
        }
    }
}
