using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public interface IPostRepository : IRepository<Post, int> { }
