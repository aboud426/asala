using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.ClientPages.Models;

namespace Asala.Core.Modules.ClientPages.Db;

public interface IProductsPagesLocalizedRepository : IRepository<ProductsPagesLocalized, int>
{
    Task<IEnumerable<ProductsPagesLocalized>> GetByProductsPagesIdAsync(int productsPagesId);
    Task<ProductsPagesLocalized?> GetByProductsPagesIdAndLanguageIdAsync(
        int productsPagesId,
        int languageId
    );
}
