using Asala.Core.Db;
using Asala.Core.Db.Repositories;

namespace Asala.Core.Modules.Languages;

public class LanguageRepository : Repository<Language, int>, ILanguageRepository
{
    public LanguageRepository(AsalaDbContext context)
        : base(context) { }
}
