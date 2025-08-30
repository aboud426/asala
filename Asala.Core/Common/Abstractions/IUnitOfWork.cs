using Asala.Core.Common.Models;

namespace Asala.Core.Common.Abstractions;

public interface IUnitOfWork : IDisposable
{
    Task<Result> BeginTransactionAsync(CancellationToken cancellationToken = default);

    Task<Result> CommitTransactionAsync(CancellationToken cancellationToken = default);

    Task<Result> RollbackTransactionAsync(CancellationToken cancellationToken = default);

    Task<Result<int>> SaveChangesAsync(CancellationToken cancellationToken = default);

    IRepository<TEntity, TPrimaryKey> Repository<TEntity, TPrimaryKey>()
        where TEntity : BaseEntity<TPrimaryKey>
        where TPrimaryKey : notnull;
}
