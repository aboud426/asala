using System;
using System.Threading.Tasks;

namespace Infrastructure.Common;

/// <summary>
/// Extension methods for Result types to provide fluent API
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Executes a function if the result is successful
    /// </summary>
    public static Result<TOut> Map<TIn, TOut>(this Result<TIn> result, Func<TIn, TOut> func)
    {
        if (result.IsFailure)
            return Result.Failure<TOut>(result.Error);

        try
        {
            var value = func(result.Value!);
            return Result.Success(value);
        }
        catch (Exception ex)
        {
            return Result.Failure<TOut>(ex.Message);
        }
    }

    /// <summary>
    /// Executes an async function if the result is successful
    /// </summary>
    public static async Task<Result<TOut>> MapAsync<TIn, TOut>(this Result<TIn> result, Func<TIn, Task<TOut>> func)
    {
        if (result.IsFailure)
            return Result.Failure<TOut>(result.Error);

        try
        {
            var value = await func(result.Value!);
            return Result.Success(value);
        }
        catch (Exception ex)
        {
            return Result.Failure<TOut>(ex.Message);
        }
    }

    /// <summary>
    /// Chains another operation if the current result is successful
    /// </summary>
    public static Result<TOut> Bind<TIn, TOut>(this Result<TIn> result, Func<TIn, Result<TOut>> func)
    {
        if (result.IsFailure)
            return Result.Failure<TOut>(result.Error);

        return func(result.Value!);
    }

    /// <summary>
    /// Chains another async operation if the current result is successful
    /// </summary>
    public static async Task<Result<TOut>> BindAsync<TIn, TOut>(this Result<TIn> result, Func<TIn, Task<Result<TOut>>> func)
    {
        if (result.IsFailure)
            return Result.Failure<TOut>(result.Error);

        return await func(result.Value!);
    }

    /// <summary>
    /// Executes an action if the result is successful
    /// </summary>
    public static Result<T> Tap<T>(this Result<T> result, Action<T> action)
    {
        if (result.IsSuccess)
            action(result.Value!);

        return result;
    }

    /// <summary>
    /// Executes an async action if the result is successful
    /// </summary>
    public static async Task<Result<T>> TapAsync<T>(this Result<T> result, Func<T, Task> action)
    {
        if (result.IsSuccess)
            await action(result.Value!);

        return result;
    }

    /// <summary>
    /// Returns the value if successful, otherwise returns the default value
    /// </summary>
    public static T ValueOrDefault<T>(this Result<T> result, T defaultValue = default!)
    {
        return result.IsSuccess ? result.Value! : defaultValue;
    }

    /// <summary>
    /// Returns the value if successful, otherwise throws an exception
    /// </summary>
    public static T ValueOrThrow<T>(this Result<T> result)
    {
        if (result.IsFailure)
            throw new InvalidOperationException(result.Error);

        return result.Value!;
    }

    /// <summary>
    /// Executes an action if the result is failed
    /// </summary>
    public static Result<T> OnFailure<T>(this Result<T> result, Action<string> action)
    {
        if (result.IsFailure)
            action(result.Error);

        return result;
    }

    /// <summary>
    /// Executes an async action if the result is failed
    /// </summary>
    public static async Task<Result<T>> OnFailureAsync<T>(this Result<T> result, Func<string, Task> action)
    {
        if (result.IsFailure)
            await action(result.Error);

        return result;
    }
}