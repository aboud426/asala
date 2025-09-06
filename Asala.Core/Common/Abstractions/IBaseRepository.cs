using System.Linq.Expressions;
using Asala.Core.Common.Models;

namespace Asala.Core.Common.Abstractions;

public interface IBaseRepository<TEntity, TPrimaryKey>
    where TEntity : class
{
    Task<Result<TEntity?>> GetByIdAsync(
        TPrimaryKey id,
        CancellationToken cancellationToken = default
    );

    Task<Result<IEnumerable<TEntity>>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<TEntity>>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes
    );

    Task<Result<PaginatedResult<TEntity>>> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes
    );

    Task<Result<TEntity?>> GetFirstOrDefaultAsync(
        Expression<Func<TEntity, bool>> filter,
        params Expression<Func<TEntity, object>>[] includes
    );

    Task<Result<bool>> AnyAsync(
        Expression<Func<TEntity, bool>> filter,
        CancellationToken cancellationToken = default
    );

    Task<Result<int>> CountAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<TEntity>> AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    Task<Result> AddRangeAsync(
        IEnumerable<TEntity> entities,
        CancellationToken cancellationToken = default
    );

    Result<TEntity> Update(TEntity entity);

    Result UpdateRange(IEnumerable<TEntity> entities);

    Result Remove(TEntity entity);

    Task<Result> RemoveByIdAsync(TPrimaryKey id, CancellationToken cancellationToken = default);
    IQueryable<TEntity> GetQueryable();

    Result RemoveRange(IEnumerable<TEntity> entities);
}
