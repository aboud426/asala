using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Infrastructure.Models;
using Infrastructure.Interfaces;
using Infrastructure.Common;

namespace Infrastructure.Repository;

/// <summary>
/// Unit of Work implementation using Entity Framework Core
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly TourTradeDbContext _context;
    private readonly Dictionary<Type, object> _repositories;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    // Lazy-loaded repositories for main entities
    private IRepository<User>? _users;
    private IRepository<Product>? _products;
    private IRepository<Order>? _orders;
    private IRepository<Provider>? _providers;
    private IRepository<Post>? _posts;
    private IRepository<Category>? _categories;
    private IRepository<Location>? _locations;
    private IRepository<Language>? _languages;

    public UnitOfWork(TourTradeDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _repositories = new Dictionary<Type, object>();
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Product> Products => _products ??= new Repository<Product>(_context);
    public IRepository<Order> Orders => _orders ??= new Repository<Order>(_context);
    public IRepository<Provider> Providers => _providers ??= new Repository<Provider>(_context);
    public IRepository<Post> Posts => _posts ??= new Repository<Post>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
    public IRepository<Location> Locations => _locations ??= new Repository<Location>(_context);
    public IRepository<Language> Languages => _languages ??= new Repository<Language>(_context);

    public async Task<Result> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction != null)
                return Result.Failure("Transaction already in progress");

            _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error beginning transaction: {ex.Message}");
        }
    }

    public async Task<Result> CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction == null)
                return Result.Failure("No active transaction to commit");

            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
            return Result.Success();
        }
        catch (Exception ex)
        {
            await RollbackTransactionAsync(cancellationToken);
            return Result.Failure($"Error committing transaction: {ex.Message}");
        }
    }

    public async Task<Result> RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_transaction == null)
                return Result.Failure("No active transaction to rollback");

            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error rolling back transaction: {ex.Message}");
        }
    }

    public async Task<Result<int>> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var changes = await _context.SaveChangesAsync(cancellationToken);
            return Result<int>.Success(changes);
        }
        catch (DbUpdateException ex)
        {
            return Result.Failure<int>($"Database update error: {ex.Message}");
        }
        catch (Exception ex)
        {
            return Result.Failure<int>($"Error saving changes: {ex.Message}");
        }
    }

    public IRepository<TEntity> Repository<TEntity>() where TEntity : class
    {
        var type = typeof(TEntity);

        if (_repositories.TryGetValue(type, out var existingRepository))
        {
            return (IRepository<TEntity>)existingRepository;
        }

        var repository = new Repository<TEntity>(_context);
        _repositories[type] = repository;
        return repository;
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _context.Dispose();
            _repositories.Clear();
        }
        _disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    ~UnitOfWork()
    {
        Dispose(false);
    }
}