using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.DTOs;

namespace Asala.UseCases.Shopping;

public interface IOrderStatusService
{
    Task<Result<OrderStatusDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<OrderStatusDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default);
    Task<Result<List<OrderStatusDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default);
    Task<Result<OrderStatusDto>> CreateAsync(CreateOrderStatusDto createDto, CancellationToken cancellationToken = default);
    Task<Result<OrderStatusDto>> UpdateAsync(int id, UpdateOrderStatusDto updateDto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(int id, CancellationToken cancellationToken = default);
}
