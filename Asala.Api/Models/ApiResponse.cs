namespace Asala.Api.Models;

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string MessageCode { get; set; } = string.Empty;

    public ApiResponse() { }

    public ApiResponse(bool success, string message, string messageCode)
    {
        Success = success;
        Message = message;
        MessageCode = messageCode;
    }
}

public class ApiResponse<T> : ApiResponse
{
    public T Data { get; set; } = default!;

    public ApiResponse(T data, string message, string messageCode)
        : base(true, message, messageCode)
    {
        Data = data;
    }
}
