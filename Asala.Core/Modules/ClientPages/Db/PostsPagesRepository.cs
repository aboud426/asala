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
}
