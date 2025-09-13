using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IPostsPagesLocalizedRepository : IRepository<PostsPagesLocalized, int>
{
    Task<IEnumerable<PostsPagesLocalized>> GetByPostsPagesIdAsync(int postsPagesId);
    Task<PostsPagesLocalized?> GetByPostsPagesIdAndLanguageIdAsync(
        int postsPagesId,
        int languageId
    );
}
