# API Development Guide

## How to Implement a New Feature Following the Architecture

This guide walks you through creating a new API feature using the established architecture patterns. We'll use the Language module as a reference and show you how to create similar modules.

## Step-by-Step Implementation

### Step 1: Define the Domain Entity

Create your entity in `Asala.Core/Modules/{ModuleName}/Models/`:

```csharp
// Asala.Core/Modules/Products/Models/Product.cs
using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class Product : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    
    // Navigation properties (if needed)
    // public Category Category { get; set; } = null!;
}
```

**Key Points:**
- Inherit from `BaseEntity<T>` where T is your primary key type
- Use nullable reference types (`= null!` for required properties)
- `BaseEntity` provides: `Id`, `IsActive`, `IsDeleted`, `CreatedAt`, `UpdatedAt`, `DeletedAt`

### Step 2: Create DTOs

Create your DTOs in `Asala.Core/Modules/{ModuleName}/DTOs/`:

```csharp
// Asala.Core/Modules/Products/DTOs/ProductDto.cs
namespace Asala.Core.Modules.Products.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; }
}

public class ProductDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
```

**DTO Guidelines:**
- **ReadDto**: Contains all properties for display
- **CreateDto**: Contains only properties needed for creation
- **UpdateDto**: Contains properties that can be updated
- **DropdownDto**: Minimal properties for dropdown lists

### Step 3: Configure Entity Framework

Create entity configuration in `Asala.Core/Db/Configurations/`:

```csharp
// Asala.Core/Db/Configurations/ProductConfiguration.cs
using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductConfiguration : BaseEntityConfiguration<Product, int>
{
    public override void Configure(EntityTypeBuilder<Product> builder)
    {
        base.Configure(builder); // Configures BaseEntity properties
        
        builder.ToTable("Products");
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Property(e => e.Price)
            .HasColumnType("decimal(18,2)");
            
        // Add indexes
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
    }
}
```

**Configuration Guidelines:**
- Inherit from `BaseEntityConfiguration<TEntity, TPrimaryKey>`
- Call `base.Configure(builder)` to apply BaseEntity configurations
- Define table name, column constraints, and indexes
- Use appropriate data types (especially for decimals)

### Step 4: Create Repository Interface

Create repository interface in `Asala.Core/Modules/{ModuleName}/Db/`:

```csharp
// Asala.Core/Modules/Products/Db/IProductRepository.cs
using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public interface IProductRepository : IRepository<Product, int>
{
    // Add any custom repository methods here if needed
    // Most operations are covered by the base IRepository interface
}
```

### Step 5: Implement Repository

Create repository implementation in `Asala.Core/Modules/{ModuleName}/Db/`:

```csharp
// Asala.Core/Modules/Products/Db/ProductRepository.cs
using Asala.Core.Db.Contexts;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductRepository : Repository<Product, int>, IProductRepository
{
    public ProductRepository(AsalaDbContext context) : base(context)
    {
    }
    
    // Implement any custom methods here if needed
}
```

### Step 6: Create Service Interface

Create service interface in `Asala.UseCases/{ModuleName}/`:

```csharp
// Asala.UseCases/Products/IProductService.cs
using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.DTOs;

namespace Asala.UseCases.Products;

public interface IProductService
{
    Task<Result<PaginatedResult<ProductDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProductDto>> CreateAsync(
        CreateProductDto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<ProductDto?>> UpdateAsync(
        int id,
        UpdateProductDto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result<IEnumerable<ProductDropdownDto>>> GetDropdownAsync(
        CancellationToken cancellationToken = default
    );
}
```

### Step 7: Implement Service

Create service implementation in `Asala.UseCases/{ModuleName}/`:

```csharp
// Asala.UseCases/Products/ProductService.cs
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Products.DTOs;
using Asala.Core.Modules.Products.Db;

namespace Asala.UseCases.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<ProductDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<Product, bool>> filter = activeOnly
            ? p => p.IsActive && !p.IsDeleted
            : p => !p.IsDeleted;

        var result = await _productRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(p => p.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<ProductDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<ProductDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<ProductDto>> CreateAsync(
        CreateProductDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateProductDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<ProductDto>(validationResult.MessageCode);

        var product = new Product
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            Price = createDto.Price,
            CategoryId = createDto.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var addResult = await _productRepository.AddAsync(product, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<ProductDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<ProductDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    // ... implement other methods following the same pattern

    #region Validation Methods
    
    private static Result ValidateCreateProductDto(CreateProductDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.PRODUCT_NAME_REQUIRED);

        if (createDto.Name.Length > 200)
            return Result.Failure(MessageCodes.PRODUCT_NAME_TOO_LONG);

        if (createDto.Price <= 0)
            return Result.Failure(MessageCodes.PRODUCT_PRICE_INVALID);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
        };
    }

    private static ProductDropdownDto MapToDropdownDto(Product product)
    {
        return new ProductDropdownDto
        {
            Id = product.Id,
            Name = product.Name,
        };
    }

    #endregion
}
```

### Step 8: Create Controller

Create controller in `Asala.Api/Controllers/`:

```csharp
// Asala.Api/Controllers/ProductController.cs
using Asala.Core.Modules.Products.DTOs;
using Asala.UseCases.Products;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : BaseController
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
        : base()
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    // ... implement other endpoints following the same pattern
}
```

### Step 9: Register Dependencies

Update dependency registration files:

```csharp
// Asala.Core/Common/Extensions/ServiceCollectionExtensions.cs
public static IServiceCollection AddModuleRepositories(this IServiceCollection services)
{
    services.AddScoped<ILanguageRepository, LanguageRepository>();
    services.AddScoped<IProductRepository, ProductRepository>(); // Add this line
    return services;
}
```

```csharp
// Asala.UseCases/Extensions/ServiceCollectionExtensions.cs  
public static IServiceCollection AddUseCases(this IServiceCollection services)
{
    services.AddScoped<ILanguageService, LanguageService>();
    services.AddScoped<IProductService, ProductService>(); // Add this line
    return services;
}
```

### Step 10: Add Entity to DbContext

Update `AsalaDbContext` to include your new entity:

```csharp
// Asala.Core/Db/Contexts/AsalaDbContext.cs
public DbSet<Product> Products { get; set; } = null!;

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... existing configurations
    modelBuilder.ApplyConfiguration(new ProductConfiguration()); // Add this line
}
```

### Step 11: Create and Run Migration

```bash
# From the project root directory
dotnet ef migrations add AddProduct --project Asala.Api --startup-project Asala.Api

# Apply the migration
dotnet ef database update --project Asala.Api --startup-project Asala.Api
```

## Common Patterns and Best Practices

### 1. Error Handling
- Always use `Result<T>` or `Result` for operation outcomes
- Never throw exceptions for business logic failures
- Use meaningful message codes from `MessageCodes`

### 2. Validation
- Validate input in service layer, not controller
- Create separate validation methods for different DTOs
- Return specific error codes for different validation failures

### 3. Mapping
- Keep mapping logic in service layer
- Create separate mapping methods for different DTO types
- Consider using mapping libraries for complex scenarios

### 4. Async/Await
- All database operations must be async
- Always pass `CancellationToken` through the chain
- Use `ConfigureAwait(false)` in library code (optional)

### 5. Naming Conventions
- Use descriptive names for all components
- Follow established naming patterns
- Keep consistency across modules

## Testing Your Implementation

1. **Build the project** to ensure no compilation errors
2. **Run migrations** to update the database
3. **Test endpoints** using tools like Postman or Swagger UI
4. **Check error scenarios** to ensure proper error handling

## Next Steps

- Review [Language Controller API Reference](./language-controller-api-reference.md) for detailed endpoint documentation
- Check [Best Practices](./best-practices.md) for additional guidelines
- See [Code Examples](./code-examples.md) for more templates
