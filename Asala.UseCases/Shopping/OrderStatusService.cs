using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Db;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.UseCases.Shopping;

public class OrderStatusService : IOrderStatusService
{
    private readonly IOrderStatusRepository _orderStatusRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderStatusService(IOrderStatusRepository orderStatusRepository, IUnitOfWork unitOfWork)
    {
        _orderStatusRepository = orderStatusRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OrderStatusDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_ID_INVALID);

            var result = await _orderStatusRepository.GetByIdAsync(id, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<OrderStatusDto>(result.MessageCode);

            if (result.Value == null)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NOT_FOUND);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderStatusDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<OrderStatusDto>>> GetAllAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<OrderStatus, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = os => os.IsActive == isActive.Value && !os.IsDeleted;
            }
            else
            {
                filter = os => !os.IsDeleted;
            }

            var result = await _orderStatusRepository.GetPaginatedAsync(page, pageSize, filter, orderBy: q => q.OrderBy(os => os.Name));
            if (!result.IsSuccess)
                return Result.Failure<PaginatedResult<OrderStatusDto>>(result.MessageCode);

            var dtos = result.Value.Items.Select(MapToDto).ToList();
            var paginatedResult = new PaginatedResult<OrderStatusDto>(
                dtos,
                result.Value.TotalCount,
                result.Value.Page,
                result.Value.PageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<OrderStatusDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<List<OrderStatusDropdownDto>>> GetDropdownAsync(bool? isActive = true, CancellationToken cancellationToken = default)
    {
        try
        {
            Expression<Func<OrderStatus, bool>>? filter = null;
            if (isActive.HasValue)
            {
                filter = os => os.IsActive == isActive.Value && !os.IsDeleted;
            }
            else
            {
                filter = os => !os.IsDeleted;
            }

            var result = await _orderStatusRepository.GetAsync(filter, orderBy: q => q.OrderBy(os => os.Name));
            if (!result.IsSuccess)
                return Result.Failure<List<OrderStatusDropdownDto>>(result.MessageCode);

            var dtos = result.Value.Select(x => new OrderStatusDropdownDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();

            return Result.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<OrderStatusDropdownDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<OrderStatusDto>> CreateAsync(CreateOrderStatusDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validation
            if (string.IsNullOrWhiteSpace(createDto.Name))
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NAME_REQUIRED);

            // Check if name already exists
            var existingResult = await _orderStatusRepository.GetFirstOrDefaultAsync(os => os.Name == createDto.Name.Trim() && !os.IsDeleted);
            if (existingResult.IsSuccess && existingResult.Value != null)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NAME_ALREADY_EXISTS);

            // Create entity
            var orderStatus = new OrderStatus
            {
                Name = createDto.Name.Trim(),
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _orderStatusRepository.AddAsync(orderStatus, cancellationToken);
            if (!result.IsSuccess)
                return Result.Failure<OrderStatusDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<OrderStatusDto>(saveResult.MessageCode);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderStatusDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<OrderStatusDto>> UpdateAsync(int id, UpdateOrderStatusDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_ID_INVALID);

            if (string.IsNullOrWhiteSpace(updateDto.Name))
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NAME_REQUIRED);

            // Get existing entity
            var existingResult = await _orderStatusRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure<OrderStatusDto>(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NOT_FOUND);

            var orderStatus = existingResult.Value;

            // Check if new name already exists (excluding current record)
            var nameCheckResult = await _orderStatusRepository.GetFirstOrDefaultAsync(os => os.Name == updateDto.Name.Trim() && os.Id != id && !os.IsDeleted);
            if (nameCheckResult.IsSuccess && nameCheckResult.Value != null)
                return Result.Failure<OrderStatusDto>(MessageCodes.ORDER_STATUS_NAME_ALREADY_EXISTS);

            // Update properties
            orderStatus.Name = updateDto.Name.Trim();
            orderStatus.IsActive = updateDto.IsActive;
            orderStatus.UpdatedAt = DateTime.UtcNow;

            var result = _orderStatusRepository.Update(orderStatus);
            if (!result.IsSuccess)
                return Result.Failure<OrderStatusDto>(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<OrderStatusDto>(saveResult.MessageCode);

            var dto = MapToDto(result.Value);
            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderStatusDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.ORDER_STATUS_ID_INVALID);

            // Get existing entity
            var existingResult = await _orderStatusRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.ORDER_STATUS_NOT_FOUND);

            // For now, we'll skip the usage check since we don't have access to other repositories
            // In a real implementation, you would inject the necessary repositories to check usage

            // Soft delete
            var orderStatus = existingResult.Value;
            orderStatus.IsDeleted = true;
            orderStatus.IsActive = false;
            orderStatus.DeletedAt = DateTime.UtcNow;
            orderStatus.UpdatedAt = DateTime.UtcNow;

            var result = _orderStatusRepository.Update(orderStatus);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> ActivateAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.ORDER_STATUS_ID_INVALID);

            var existingResult = await _orderStatusRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.ORDER_STATUS_NOT_FOUND);

            var orderStatus = existingResult.Value;
            orderStatus.IsActive = true;
            orderStatus.UpdatedAt = DateTime.UtcNow;

            var result = _orderStatusRepository.Update(orderStatus);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result> DeactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
                return Result.Failure(MessageCodes.ORDER_STATUS_ID_INVALID);

            var existingResult = await _orderStatusRepository.GetByIdAsync(id, cancellationToken);
            if (!existingResult.IsSuccess)
                return Result.Failure(existingResult.MessageCode);

            if (existingResult.Value == null)
                return Result.Failure(MessageCodes.ORDER_STATUS_NOT_FOUND);

            var orderStatus = existingResult.Value;
            orderStatus.IsActive = false;
            orderStatus.UpdatedAt = DateTime.UtcNow;

            var result = _orderStatusRepository.Update(orderStatus);
            if (!result.IsSuccess)
                return Result.Failure(result.MessageCode);

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            return saveResult;
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    private static OrderStatusDto MapToDto(OrderStatus orderStatus)
    {
        return new OrderStatusDto
        {
            Id = orderStatus.Id,
            Name = orderStatus.Name,
            IsActive = orderStatus.IsActive,
            CreatedAt = orderStatus.CreatedAt,
            UpdatedAt = orderStatus.UpdatedAt
        };
    }
}
