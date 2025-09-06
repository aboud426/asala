using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public interface IProductRepository : IRepository<Product, int> { }
