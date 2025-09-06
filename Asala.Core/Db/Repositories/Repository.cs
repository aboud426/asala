using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Db.Repositories;

public class Repository<TEntity, TPrimaryKey> : IRepository<TEntity, TPrimaryKey>
    where TEntity : BaseEntity<TPrimaryKey>
{
    protected readonly AsalaDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public Repository(AsalaDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = context.Set<TEntity>();
    }

    public async Task<Result<TEntity?>> GetByIdAsync(
        TPrimaryKey id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var entity = await _dbSet
                .Where(e => !e.IsDeleted)
                .FirstOrDefaultAsync(e => e.Id!.Equals(id), cancellationToken);

            return Result.Success(entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<TEntity>>> GetAllAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var entities = await _dbSet.Where(e => !e.IsDeleted).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<TEntity>>(entities);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<TEntity>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<TEntity>>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes
    )
    {
        try
        {
            IQueryable<TEntity> query = _dbSet.Where(e => !e.IsDeleted);

            // Apply includes
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            // Apply filter
            if (filter != null)
            {
                query = query.Where(filter);
            }

            // Apply ordering
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            var entities = await query.ToListAsync();
            return Result.Success<IEnumerable<TEntity>>(entities);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<TEntity>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<TEntity>>> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            IQueryable<TEntity> query = _dbSet.Where(e => !e.IsDeleted);

            // Apply includes
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            // Apply filter
            if (filter != null)
            {
                query = query.Where(filter);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply ordering
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Apply pagination
            var entities = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            var paginatedResult = new PaginatedResult<TEntity>(
                entities,
                totalCount,
                page,
                pageSize
            );
            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<TEntity>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<TEntity?>> GetFirstOrDefaultAsync(
        Expression<Func<TEntity, bool>> filter,
        params Expression<Func<TEntity, object>>[] includes
    )
    {
        try
        {
            IQueryable<TEntity> query = _dbSet.Where(e => !e.IsDeleted);

            // Apply includes
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            var entity = await query.FirstOrDefaultAsync(filter);
            return Result.Success(entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> AnyAsync(
        Expression<Func<TEntity, bool>> filter,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var exists = await _dbSet.Where(e => !e.IsDeleted).AnyAsync(filter, cancellationToken);

            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<int>> CountAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            IQueryable<TEntity> query = _dbSet.Where(e => !e.IsDeleted);

            if (filter != null)
            {
                query = query.Where(filter);
            }

            var count = await query.CountAsync(cancellationToken);
            return Result.Success(count);
        }
        catch (Exception ex)
        {
            return Result.Failure<int>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<TEntity>> AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (entity == null)
            {
                return Result.Failure<TEntity>(MessageCodes.ENTITY_NULL);
            }

            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.IsActive = true;
            entity.IsDeleted = false;

            var addedEntity = await _dbSet.AddAsync(entity, cancellationToken);
            return Result.Success(addedEntity.Entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result> AddRangeAsync(
        IEnumerable<TEntity> entities,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (entities == null || !entities.Any())
            {
                return Result.Failure(MessageCodes.ENTITIES_NULL_OR_EMPTY);
            }

            var now = DateTime.UtcNow;
            foreach (var entity in entities)
            {
                entity.CreatedAt = now;
                entity.UpdatedAt = now;
                entity.IsActive = true;
                entity.IsDeleted = false;
            }

            await _dbSet.AddRangeAsync(entities, cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public Result<TEntity> Update(TEntity entity)
    {
        try
        {
            if (entity == null)
            {
                return Result.Failure<TEntity>(MessageCodes.ENTITY_NULL);
            }

            entity.UpdatedAt = DateTime.UtcNow;
            var updatedEntity = _dbSet.Update(entity);
            return Result.Success(updatedEntity.Entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity>(MessageCodes.DB_ERROR, ex);
        }
    }

    public Result UpdateRange(IEnumerable<TEntity> entities)
    {
        try
        {
            if (entities == null || !entities.Any())
            {
                return Result.Failure(MessageCodes.ENTITIES_NULL_OR_EMPTY);
            }

            var now = DateTime.UtcNow;
            foreach (var entity in entities)
            {
                entity.UpdatedAt = now;
            }

            _dbSet.UpdateRange(entities);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public Result Remove(TEntity entity)
    {
        try
        {
            if (entity == null)
            {
                return Result.Failure(MessageCodes.ENTITY_NULL);
            }

            // Soft delete
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _dbSet.Update(entity);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result> RemoveByIdAsync(
        TPrimaryKey id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var entity = await _dbSet.FirstOrDefaultAsync(
                e => e.Id!.Equals(id) && !e.IsDeleted,
                cancellationToken
            );

            if (entity == null)
            {
                return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);
            }

            // Soft delete
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _dbSet.Update(entity);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public Result RemoveRange(IEnumerable<TEntity> entities)
    {
        try
        {
            if (entities == null || !entities.Any())
            {
                return Result.Failure(MessageCodes.ENTITIES_NULL_OR_EMPTY);
            }

            var now = DateTime.UtcNow;
            foreach (var entity in entities)
            {
                // Soft delete
                entity.IsDeleted = true;
                entity.DeletedAt = now;
                entity.UpdatedAt = now;
            }

            _dbSet.UpdateRange(entities);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public IQueryable<TEntity> GetQueryable()
    {
        return _dbSet;
    }
}
