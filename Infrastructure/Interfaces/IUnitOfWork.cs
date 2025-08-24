using System;
using System.Threading;
using System.Threading.Tasks;
using Infrastructure.Common;

namespace Infrastructure.Interfaces;

/// <summary>
/// Unit of Work pattern interface for managing database transactions and repository access
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Repository for User entities
    /// </summary>
    IRepository<Infrastructure.Models.User> Users { get; }

    /// <summary>
    /// Repository for Product entities
    /// </summary>
    IRepository<Infrastructure.Models.Product> Products { get; }

    /// <summary>
    /// Repository for Order entities
    /// </summary>
    IRepository<Infrastructure.Models.Order> Orders { get; }

    /// <summary>
    /// Repository for Provider entities
    /// </summary>
    IRepository<Infrastructure.Models.Provider> Providers { get; }

    /// <summary>
    /// Repository for Post entities
    /// </summary>
    IRepository<Infrastructure.Models.Post> Posts { get; }

    /// <summary>
    /// Repository for Category entities
    /// </summary>
    IRepository<Infrastructure.Models.Category> Categories { get; }

    /// <summary>
    /// Repository for Location entities
    /// </summary>
    IRepository<Infrastructure.Models.Location> Locations { get; }

    /// <summary>
    /// Begins a new database transaction
    /// </summary>
    Task<Result> BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits the current transaction
    /// </summary>
    Task<Result> CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rolls back the current transaction
    /// </summary>
    Task<Result> RollbackTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves all pending changes to the database
    /// </summary>
    Task<Result<int>> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a repository for the specified entity type
    /// </summary>
    IRepository<TEntity> Repository<TEntity>() where TEntity : class;
}