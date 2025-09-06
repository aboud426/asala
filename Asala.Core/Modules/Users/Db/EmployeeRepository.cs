using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class EmployeeRepository : BaseRepository<Employee, int>, IEmployeeRepository
{
    public EmployeeRepository(AsalaDbContext context)
        : base(context, e => e.UserId) { }

    public async Task<Result<Employee?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var employee = await _dbSet.FirstOrDefaultAsync(
                e => e.UserId == userId,
                cancellationToken
            );

            return Result.Success(employee);
        }
        catch (Exception ex)
        {
            return Result.Failure<Employee?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Employee?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var employee = await (
                from e in _dbSet
                join u in _context.Users on e.UserId equals u.Id
                where u.Email.ToLower() == email.ToLower() && !u.IsDeleted
                select e
            ).FirstOrDefaultAsync(cancellationToken);

            return Result.Success(employee);
        }
        catch (Exception ex)
        {
            return Result.Failure<Employee?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Employee>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            var query = _dbSet.Include(e => e.User).AsQueryable();

            if (activeOnly.HasValue)
            {
                query = query.Where(e => e.User.IsActive == activeOnly.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var employees = await query
                .OrderBy(e => e.EmployeeName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Employee>(
                employees,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Employee>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Employee>>> SearchByNameAsync(
        string searchTerm,
        int page,
        int pageSize,
        bool? activeOnly = null,
        EmployeeSortBy sortBy = EmployeeSortBy.Name,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetPaginatedWithUserAsync(
                    page,
                    pageSize,
                    activeOnly,
                    cancellationToken
                );

            var searchPattern = $"%{searchTerm.Trim()}%";

            var query =
                from e in _dbSet
                join u in _context.Users on e.UserId equals u.Id
                where !u.IsDeleted && EF.Functions.Like(e.EmployeeName, searchPattern)
                select e;

            if (activeOnly.HasValue)
            {
                query = query.Where(e =>
                    _context.Users.Any(u => u.Id == e.UserId && u.IsActive == activeOnly.Value)
                );
            }

            var totalCount = await query.CountAsync(cancellationToken);

            // Apply sorting based on sortBy parameter
            query = sortBy switch
            {
                EmployeeSortBy.Name => query.OrderBy(e => e.EmployeeName),
                _ => query.OrderBy(e => e.EmployeeName),
            };

            var employees = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Employee>(
                employees,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Employee>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
