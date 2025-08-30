using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Db.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Asala.Core.Db.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly AsalaDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed = false;

    public UnitOfWork(AsalaDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Result> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction != null)
            {
                return Result.Failure(MessageCodes.TRANSACTION_ALREADY_EXISTS);
            }

            _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.TRANSACTION_BEGIN_ERROR, ex);
        }
    }

    public async Task<Result> CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction == null)
            {
                return Result.Failure(MessageCodes.NO_ACTIVE_TRANSACTION);
            }

            await _currentTransaction.CommitAsync(cancellationToken);
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.TRANSACTION_COMMIT_ERROR, ex);
        }
    }

    public async Task<Result> RollbackTransactionAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (_currentTransaction == null)
            {
                return Result.Failure(MessageCodes.NO_ACTIVE_TRANSACTION);
            }

            await _currentTransaction.RollbackAsync(cancellationToken);
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.TRANSACTION_ROLLBACK_ERROR, ex);
        }
    }

    public async Task<Result<int>> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _context.SaveChangesAsync(cancellationToken);
            return Result.Success(result);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            return Result.Failure<int>(MessageCodes.CONCURRENCY_ERROR, ex);
        }
        catch (DbUpdateException ex)
        {
            return Result.Failure<int>(MessageCodes.DATABASE_UPDATE_ERROR, ex);
        }
        catch (Exception ex)
        {
            return Result.Failure<int>(MessageCodes.SAVE_CHANGES_ERROR, ex);
        }
    }

    public IRepository<TEntity, TPrimaryKey> Repository<TEntity, TPrimaryKey>()
        where TEntity : BaseEntity<TPrimaryKey>
        where TPrimaryKey : notnull
    {
        return new Repository<TEntity, TPrimaryKey>(_context);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // Dispose managed resources
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
                _context.Dispose();
            }

            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    ~UnitOfWork()
    {
        Dispose(disposing: false);
    }
}
