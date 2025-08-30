using Asala.Api.Models;
using Asala.Core.Common.Models;

namespace Asala.Api.Models;

public class ApiResponseRepresenter
{
    public ApiResponse Represent<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new ApiResponse(true, result.MessageCode, result.MessageCode);
        }

        return new ApiResponse(false, result.MessageCode, result.MessageCode);
    }

    public ApiResponse Represent(Result result)
    {
        if (result.IsSuccess)
        {
            return new ApiResponse(true, result.MessageCode, result.MessageCode);
        }

        return new ApiResponse(false, result.MessageCode, result.MessageCode);
    }
}
