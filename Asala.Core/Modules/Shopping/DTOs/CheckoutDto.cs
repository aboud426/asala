namespace Asala.Core.Modules.Shopping.DTOs;

public class CheckoutDto
{
    public int ShippingAddressId { get; set; }
}

public class CheckoutResultDto
{
    public bool IsSuccess { get; set; }
    public OrderDto? Order { get; set; }
    public List<StockValidationError> StockErrors { get; set; } = [];
}

public class StockValidationError
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int RequestedQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public string Message { get; set; } = null!;
}
