using System;
using System.Collections.Generic;
using System.Linq;

namespace Asala.Core.Common.Models;

/// <summary>
/// Represents the result of an operation without return data
/// </summary>
public class Result
{
    public bool IsSuccess { get; protected set; }
    public bool IsFailure => !IsSuccess;
    public string MessageCode { get; protected set; } = string.Empty;
    public Exception? Exception { get; protected set; }

    protected Result(bool isSuccess, string messageCode = "", Exception? exception = null)
    {
        IsSuccess = isSuccess;
        MessageCode = messageCode;
        Exception = exception;
    }

    public static Result Success() => new(true);

    public static Result Failure(string errorCode) => new(false, errorCode);

    public static Result Failure(string errorCode, Exception exception) =>
        new(false, errorCode, exception);

    public static Result<T> Success<T>(T value) => new(value, true);

    public static Result<T> Failure<T>(string messageCode) => new(default!, false, messageCode);

    public static Result<T> Failure<T>(string messageCode, Exception? exception) =>
        new(default!, false, messageCode, exception);
}

/// <summary>
/// Represents the result of an operation with return data
/// </summary>
/// <typeparam name="T">The type of the return data</typeparam>
public class Result<T> : Result
{
    public T Value { get; private set; } = default!;

    protected internal Result(
        T value,
        bool isSuccess,
        string messageCode = "",
        Exception? exception = null
    )
        : base(isSuccess, messageCode, exception)
    {
        Value = value;
    }
}
