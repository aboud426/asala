using System;
using System.Collections.Generic;
using System.Linq;

namespace Infrastructure.Common;

/// <summary>
/// Represents the result of an operation without return data
/// </summary>
public class Result
{
    public bool IsSuccess { get; protected set; }
    public bool IsFailure => !IsSuccess;
    public string Error => string.Join("; ", Errors);
    public List<string> Errors { get; protected set; } = [];

    protected Result(bool isSuccess, params string[] errors)
    {
        if (isSuccess && errors.Any(e => !string.IsNullOrWhiteSpace(e)))
            throw new InvalidOperationException("Successful result cannot have errors");
        
        if (!isSuccess && !errors.Any(e => !string.IsNullOrWhiteSpace(e)))
            throw new InvalidOperationException("Failed result must have errors");

        IsSuccess = isSuccess;
        Errors = errors.Where(e => !string.IsNullOrWhiteSpace(e)).ToList();
    }

    public static Result Success() => new(true);
    public static Result Failure(string error) => new(false, error);
    public static Result Failure(List<string> errors) => new(false, errors.ToArray());
    
    // Generic factory methods
    public static Result<T> Success<T>(T value) => Result<T>.Success(value);
    public static Result<T> Failure<T>(string error) => new(default, false, error);
    public static Result<T> Failure<T>(List<string> errors) => new(default, false, errors.ToArray());
}

/// <summary>
/// Represents the result of an operation with return data
/// </summary>
/// <typeparam name="T">The type of the return data</typeparam>
public class Result<T> : Result
{
    public T? Value { get; private set; }

    protected internal Result(T? value, bool isSuccess, params string[] errors)
        : base(isSuccess, errors)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(value, true);
    
    public static implicit operator Result<T>(T value) => Success(value);
}