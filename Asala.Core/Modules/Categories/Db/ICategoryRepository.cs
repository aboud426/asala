using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public interface ICategoryRepository : IRepository<Category, int> { }
