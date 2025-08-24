using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Business.Common;

namespace Business.Interfaces;

/// <summary>
/// Generic repository interface for common data operations
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
public interface IRepository<TEntity> where TEntity : class
{
    /// <summary>
    /// Gets an entity by its primary key
    /// </summary>
    Task<Result<TEntity?>> GetByIdAsync(object id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all entities
    /// </summary>
    Task<Result<IEnumerable<TEntity>>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets entities based on a predicate
    /// </summary>
    Task<Result<IEnumerable<TEntity>>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a paginated result of entities
    /// </summary>
    Task<Result<PaginatedResult<TEntity>>> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the first entity that matches the predicate
    /// </summary>
    Task<Result<TEntity?>> GetFirstOrDefaultAsync(
        Expression<Func<TEntity, bool>> filter,
        string includeProperties = "",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if any entity matches the predicate
    /// </summary>
    Task<Result<bool>> AnyAsync(
        Expression<Func<TEntity, bool>> filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of entities that match the predicate
    /// </summary>
    Task<Result<int>> CountAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new entity
    /// </summary>
    Task<Result<TEntity>> AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple entities
    /// </summary>
    Task<Result> AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an entity
    /// </summary>
    Result<TEntity> Update(TEntity entity);

    /// <summary>
    /// Updates multiple entities
    /// </summary>
    Result UpdateRange(IEnumerable<TEntity> entities);

    /// <summary>
    /// Removes an entity
    /// </summary>
    Result Remove(TEntity entity);

    /// <summary>
    /// Removes an entity by its primary key
    /// </summary>
    Task<Result> RemoveByIdAsync(object id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes multiple entities
    /// </summary>
    Result RemoveRange(IEnumerable<TEntity> entities);
}