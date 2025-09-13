using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.ClientPages.Db;

public class PostsPagesRepository : Repository<PostsPages, int>, IPostsPagesRepository
{
    public PostsPagesRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<IEnumerable<PostsPages>> GetAllWithLocalizationsAsync()
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<PostsPages?> GetByIdWithLocalizationsAsync(int id)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
    }

    public async Task<PostsPages?> GetByKeyAsync(string key)
    {
        return await _dbSet.FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }

    public async Task<PostsPages?> GetByKeyWithLocalizationsAsync(string key)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }

    public async Task<IEnumerable<PostsPages>> GetAllWithLocalizationsAndIncludedTypesAsync()
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedPostTypes)
            .ThenInclude(i => i.PostType)
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<PostsPages?> GetByIdWithLocalizationsAndIncludedTypesAsync(int id)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedPostTypes)
            .ThenInclude(i => i.PostType)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
    }

    public async Task<PostsPages?> GetByKeyWithLocalizationsAndIncludedTypesAsync(string key)
    {
        return await _dbSet
            .Include(x => x.Localizations)
            .Include(x => x.IncludedPostTypes)
            .ThenInclude(i => i.PostType)
            .FirstOrDefaultAsync(x => x.Key == key && x.IsActive);
    }

    public async Task AddIncludedPostTypesAsync(int postsPagesId, IEnumerable<int> postTypeIds)
    {
        var includedPostTypes = postTypeIds.Select(typeId => new IncludedPostType
        {
            PostsPagesId = postsPagesId,
            PostTypeId = typeId,
        });

        await _context.Set<IncludedPostType>().AddRangeAsync(includedPostTypes);
    }

    public async Task UpdateIncludedPostTypesAsync(int postsPagesId, IEnumerable<int> postTypeIds)
    {
        // Remove existing included types
        await RemoveIncludedPostTypesAsync(postsPagesId);

        // Add new included types
        if (postTypeIds.Any())
        {
            await AddIncludedPostTypesAsync(postsPagesId, postTypeIds);
        }
    }

    public async Task RemoveIncludedPostTypesAsync(int postsPagesId)
    {
        var existingIncludedTypes = await _context
            .Set<IncludedPostType>()
            .Where(x => x.PostsPagesId == postsPagesId)
            .ToListAsync();

        if (existingIncludedTypes.Any())
        {
            _context.Set<IncludedPostType>().RemoveRange(existingIncludedTypes);
        }
    }
}
