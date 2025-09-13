using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.ClientPages.Db;

public class PostsPagesLocalizedRepository
    : Repository<PostsPagesLocalized, int>,
        IPostsPagesLocalizedRepository
{
    public PostsPagesLocalizedRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<IEnumerable<PostsPagesLocalized>> GetByPostsPagesIdAsync(int postsPagesId)
    {
        return await _dbSet
            .Where(x => x.PostsPagesId == postsPagesId && x.IsActive)
            .OrderBy(x => x.LanguageId)
            .ToListAsync();
    }

    public async Task<PostsPagesLocalized?> GetByPostsPagesIdAndLanguageIdAsync(
        int postsPagesId,
        int languageId
    )
    {
        return await _dbSet.FirstOrDefaultAsync(x =>
            x.PostsPagesId == postsPagesId && x.LanguageId == languageId && x.IsActive
        );
    }
}
