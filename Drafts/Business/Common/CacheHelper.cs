using Microsoft.Extensions.Caching.Memory;
using Infrastructure.Common;

namespace Business.Common;

/// <summary>
/// Helper class for cache operations with consistent behavior
/// </summary>
public static class CacheHelper
{
    /// <summary>
    /// Default cache expiration times
    /// </summary>
    public static class ExpirationTimes
    {
        public static readonly TimeSpan Short = TimeSpan.FromMinutes(5);     // 5 minutes
        public static readonly TimeSpan Medium = TimeSpan.FromMinutes(15);   // 15 minutes
        public static readonly TimeSpan Long = TimeSpan.FromHours(1);        // 1 hour
        public static readonly TimeSpan VeryLong = TimeSpan.FromHours(24);   // 24 hours
    }

    /// <summary>
    /// Gets a value from cache or executes the factory function if not found
    /// </summary>
    public static async Task<Result<T>> GetOrSetAsync<T>(
        this IMemoryCache cache,
        string key,
        Func<Task<Result<T>>> factory,
        TimeSpan? expiration = null)
    {
        if (cache.TryGetValue(key, out var cachedResult) && cachedResult is Result<T> result)
        {
            return result;
        }

        var newResult = await factory();
        
        if (newResult.IsSuccess)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? ExpirationTimes.Medium,
                Priority = CacheItemPriority.Normal
            };
            
            cache.Set(key, newResult, options);
        }

        return newResult;
    }

    /// <summary>
    /// Gets a value from cache or executes the factory function if not found (synchronous)
    /// </summary>
    public static Result<T> GetOrSet<T>(
        this IMemoryCache cache,
        string key,
        Func<Result<T>> factory,
        TimeSpan? expiration = null)
    {
        if (cache.TryGetValue(key, out var cachedResult) && cachedResult is Result<T> result)
        {
            return result;
        }

        var newResult = factory();
        
        if (newResult.IsSuccess)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? ExpirationTimes.Medium,
                Priority = CacheItemPriority.Normal
            };
            
            cache.Set(key, newResult, options);
        }

        return newResult;
    }

    /// <summary>
    /// Removes cache entries by pattern (starts with)
    /// </summary>
    public static void RemoveByPattern(this IMemoryCache cache, string pattern)
    {
        if (cache is MemoryCache memoryCache)
        {
            var field = typeof(MemoryCache).GetField("_coherentState", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            if (field?.GetValue(memoryCache) is object coherentState)
            {
                var entriesCollection = coherentState.GetType()
                    .GetProperty("EntriesCollection", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                
                if (entriesCollection?.GetValue(coherentState) is System.Collections.IDictionary entries)
                {
                    var keysToRemove = new List<object>();
                    
                    foreach (System.Collections.DictionaryEntry entry in entries)
                    {
                        if (entry.Key.ToString()?.StartsWith(pattern) == true)
                        {
                            keysToRemove.Add(entry.Key);
                        }
                    }

                    foreach (var key in keysToRemove)
                    {
                        cache.Remove(key);
                    }
                }
            }
        }
    }

    /// <summary>
    /// Removes multiple cache entries
    /// </summary>
    public static void RemoveMultiple(this IMemoryCache cache, params string[] keys)
    {
        foreach (var key in keys)
        {
            cache.Remove(key);
        }
    }
}