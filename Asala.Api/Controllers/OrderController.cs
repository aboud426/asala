// using Asala.Core.Modules.Shopping.DTOs;
// using Asala.Core.Modules.Shopping.Models;
// using Asala.UseCases.Shopping;
// using Microsoft.AspNetCore.Mvc;

// namespace Asala.Api.Controllers;

// [ApiController]
// [Route("api/orders")]
// public class OrderController : BaseController
// {
//     private readonly IOrderService _orderService;

//     public OrderController(IOrderService orderService)
//         : base()
//     {
//         _orderService = orderService;
//     }

//     [HttpPost("create")]
//     public async Task<IActionResult> CreateOrder(
//         [FromBody] CreateOrderDto createOrderDto,
//         CancellationToken cancellationToken = default
//     )
//     {
//         var result = await _orderService.CreateOrderAsync(createOrderDto, cancellationToken);
//         return CreateResponse(result);
//     }

//     [HttpGet("{id}")]
//     public async Task<IActionResult> GetOrderById(
//         [FromRoute] int id,
//         CancellationToken cancellationToken = default
//     )
//     {
//         var result = await _orderService.GetOrderByIdAsync(id, cancellationToken);
//         return CreateResponse(result);
//     }

//     [HttpGet("user/{userId}")]
//     public async Task<IActionResult> GetOrdersByUserId(
//         [FromRoute] int userId,
//         [FromQuery] int page = 1,
//         [FromQuery] int pageSize = 10,
//         CancellationToken cancellationToken = default
//     )
//     {
//         var result = await _orderService.GetOrdersByUserIdAsync(
//             userId,
//             page,
//             pageSize,
//             cancellationToken
//         );
//         return CreateResponse(result);
//     }

//     [HttpGet]
//     public async Task<IActionResult> GetPaginatedOrders(
//         [FromQuery] int page = 1,
//         [FromQuery] int pageSize = 10,
//         [FromQuery] OrderStatus? status = null,
//         [FromQuery] bool? activeOnly = null,
//         CancellationToken cancellationToken = default
//     )
//     {
//         var result = await _orderService.GetPaginatedOrdersAsync(
//             page,
//             pageSize,
//             status,
//             activeOnly,
//             cancellationToken
//         );
//         return CreateResponse(result);
//     }
// }
