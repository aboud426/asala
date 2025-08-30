using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;

namespace Infrastructure.Repository;

/// <summary>
/// Generic repository implementation using Entity Framework Core
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly TourTradeDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public Repository(TourTradeDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = context.Set<TEntity>();
    }

    public virtual async Task<Result<TEntity?>> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = await _dbSet.FindAsync(new object[] { id }, cancellationToken);
            return Result<TEntity?>.Success(entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity?>($"Error retrieving entity by id: {ex.Message}");
        }
    }

    public virtual async Task<Result<IEnumerable<TEntity>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var entities = await _dbSet.ToListAsync(cancellationToken);
            return Result<IEnumerable<TEntity>>.Success(entities);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<TEntity>>($"Error retrieving entities: {ex.Message}");
        }
    }

    public virtual async Task<Result<IEnumerable<TEntity>>> GetAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        CancellationToken cancellationToken = default)
    {
        try
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
                query = query.Where(filter);

            foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            if (orderBy != null)
                query = orderBy(query);

            var entities = await query.ToListAsync(cancellationToken);
            return Result<IEnumerable<TEntity>>.Success(entities);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<TEntity>>($"Error executing query: {ex.Message}");
        }
    }

    public virtual async Task<Result<PaginatedResult<TEntity>>> GetPaginatedAsync(
        int page,
        int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        string includeProperties = "",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (page < 1)
                return Result.Failure<PaginatedResult<TEntity>>("Page must be greater than 0");

            if (pageSize < 1 || pageSize > 1000)
                return Result.Failure<PaginatedResult<TEntity>>("PageSize must be between 1 and 1000");

            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
                query = query.Where(filter);

            var totalCount = await query.CountAsync(cancellationToken);

            foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            if (orderBy != null)
                query = orderBy(query);

            var entities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return PaginatedResult<TEntity>.Create(entities, totalCount, page, pageSize);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<TEntity>>($"Error executing paginated query: {ex.Message}");
        }
    }

    public virtual async Task<Result<TEntity?>> GetFirstOrDefaultAsync(
        Expression<Func<TEntity, bool>> filter,
        string includeProperties = "",
        CancellationToken cancellationToken = default)
    {
        try
        {
            IQueryable<TEntity> query = _dbSet;

            foreach (var includeProperty in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            var entity = await query.FirstOrDefaultAsync(filter, cancellationToken);
            return Result<TEntity?>.Success(entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity?>($"Error executing query: {ex.Message}");
        }
    }

    public virtual async Task<Result<bool>> AnyAsync(
        Expression<Func<TEntity, bool>> filter,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var exists = await _dbSet.AnyAsync(filter, cancellationToken);
            return Result<bool>.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>($"Error checking existence: {ex.Message}");
        }
    }

    public virtual async Task<Result<int>> CountAsync(
        Expression<Func<TEntity, bool>>? filter = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
                query = query.Where(filter);

            var count = await query.CountAsync(cancellationToken);
            return Result<int>.Success(count);
        }
        catch (Exception ex)
        {
            return Result.Failure<int>($"Error counting entities: {ex.Message}");
        }
    }

    public virtual async Task<Result<TEntity>> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        try
        {
            if (entity == null)
                return Result.Failure<TEntity>("Entity cannot be null");

            var addedEntity = await _dbSet.AddAsync(entity, cancellationToken);
            return Result<TEntity>.Success(addedEntity.Entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity>($"Error adding entity: {ex.Message}");
        }
    }

    public virtual async Task<Result> AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        try
        {
            if (entities == null)
                return Result.Failure("Entities cannot be null");

            await _dbSet.AddRangeAsync(entities, cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error adding entities: {ex.Message}");
        }
    }

    public virtual Result<TEntity> Update(TEntity entity)
    {
        try
        {
            if (entity == null)
                return Result.Failure<TEntity>("Entity cannot be null");

            var updatedEntity = _dbSet.Update(entity);
            return Result<TEntity>.Success(updatedEntity.Entity);
        }
        catch (Exception ex)
        {
            return Result.Failure<TEntity>($"Error updating entity: {ex.Message}");
        }
    }

    public virtual Result UpdateRange(IEnumerable<TEntity> entities)
    {
        try
        {
            if (entities == null)
                return Result.Failure("Entities cannot be null");

            _dbSet.UpdateRange(entities);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error updating entities: {ex.Message}");
        }
    }

    public virtual Result Remove(TEntity entity)
    {
        try
        {
            if (entity == null)
                return Result.Failure("Entity cannot be null");

            _dbSet.Remove(entity);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error removing entity: {ex.Message}");
        }
    }

    public virtual async Task<Result> RemoveByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = await _dbSet.FindAsync(new object[] { id }, cancellationToken);
            if (entity == null)
                return Result.Failure("Entity not found");

            _dbSet.Remove(entity);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error removing entity: {ex.Message}");
        }
    }

    public virtual Result RemoveRange(IEnumerable<TEntity> entities)
    {
        try
        {
            if (entities == null)
                return Result.Failure("Entities cannot be null");

            _dbSet.RemoveRange(entities);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error removing entities: {ex.Message}");
        }
    }
}