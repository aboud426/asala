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
    public ErrorDetail? Error { get; protected set; }
    public List<ErrorDetail> Errors { get; protected set; } = [];

    protected Result(bool isSuccess, ErrorDetail? error = null)
    {
        if (isSuccess && error != null)
            throw new InvalidOperationException("Successful result cannot have an error");
        
        if (!isSuccess && error == null)
            throw new InvalidOperationException("Failed result must have an error");

        IsSuccess = isSuccess;
        Error = error;
        
        if (error != null)
        {
            Errors = [error];
        }
    }

    protected Result(bool isSuccess, List<ErrorDetail> errors)
    {
        if (isSuccess && errors.Any())
            throw new InvalidOperationException("Successful result cannot have errors");
        
        if (!isSuccess && !errors.Any())
            throw new InvalidOperationException("Failed result must have errors");

        IsSuccess = isSuccess;
        Errors = errors;
        Error = errors.FirstOrDefault();
    }

    public static Result Success() => new(true);
    public static Result Failure(string errorCode) => new(false, new ErrorDetail(errorCode));
    public static Result Failure(ErrorDetail error) => new(false, error);
    public static Result Failure(List<ErrorDetail> errors) => new(false, errors);
    
    // Generic factory methods
    public static Result<T> Success<T>(T value) => Result<T>.Success(value);
    public static Result<T> Failure<T>(string errorCode) => new(default, false, new ErrorDetail(errorCode));
    public static Result<T> Failure<T>(ErrorDetail error) => new(default, false, error);
    public static Result<T> Failure<T>(List<ErrorDetail> errors) => new(default, false, errors);
}

/// <summary>
/// Represents the result of an operation with return data
/// </summary>
/// <typeparam name="T">The type of the return data</typeparam>
public class Result<T> : Result
{
    public T? Value { get; private set; }

    protected internal Result(T? value, bool isSuccess, ErrorDetail? error = null)
        : base(isSuccess, error)
    {
        Value = value;
    }

    protected internal Result(T? value, bool isSuccess, List<ErrorDetail> errors)
        : base(isSuccess, errors)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(value, true);
    
    public static implicit operator Result<T>(T value) => Success(value);
}