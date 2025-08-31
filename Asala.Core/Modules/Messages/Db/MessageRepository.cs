using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Messages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Messages.Db;

public class MessageRepository : Repository<Message, int>, IMessageRepository
{
    public MessageRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<Message?>> GetByKeyWithLocalizationsAsync(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var message = await _dbSet
                .Where(m => !m.IsDeleted && m.Key == key)
                .Include(m => m.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language)
                .FirstOrDefaultAsync(cancellationToken);

            return Result.Success(message);
        }
        catch (Exception ex)
        {
            return Result.Failure<Message?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Message>>> GetPaginatedWithLocalizationsAsync(
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

            IQueryable<Message> query = _dbSet.Where(m => !m.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(m => m.IsActive == activeOnly.Value);
            }

            // Include localizations and their languages
            query = query
                .Include(m => m.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language);

            var totalCount = await query.CountAsync(cancellationToken);

            var messages = await query
                .OrderBy(m => m.Key)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Message>(
                messages,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Message>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Message?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var message = await _dbSet
                .Where(m => !m.IsDeleted && m.Id == id)
                .Include(m => m.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language)
                .FirstOrDefaultAsync(cancellationToken);

            return Result.Success(message);
        }
        catch (Exception ex)
        {
            return Result.Failure<Message?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByKeyAsync(
        string key,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            IQueryable<Message> query = _dbSet.Where(m => !m.IsDeleted && m.Key == key);

            if (excludeId.HasValue)
            {
                query = query.Where(m => m.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetMessagesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds messages that don't have translations for all active languages
            // It works by:
            // 1. Getting the cross product of active messages and active languages
            // 2. Left joining with existing message localizations
            // 3. Finding combinations where no localization exists
            // 4. Grouping by message and counting missing translations
            // 5. Returning messages that have missing translations
            var query =
                from message in _context.Messages
                where message.IsActive && !message.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.MessageLocalizations
                    on new { MessageId = message.Id, LanguageId = language.Id } equals new
                    {
                        MessageId = localization.MessageId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { MessageId = message.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.MessageId)
                .Select(g => g.Key)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<int>>(missingTranslations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
