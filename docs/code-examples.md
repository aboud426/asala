# Code Examples & Templates

## Overview

This document provides ready-to-use templates and code examples for implementing new features in the Asala project. Use these as starting points for your implementations.

---

## Quick Start Checklist

When implementing a new module, follow this checklist:

- [ ] Create domain entity
- [ ] Create DTOs (Create, Update, Read, Dropdown)
- [ ] Create entity configuration
- [ ] Create repository interface and implementation
- [ ] Create service interface and implementation
- [ ] Create controller
- [ ] Register dependencies
- [ ] Add to DbContext
- [ ] Create and run migration
- [ ] Test endpoints

---

## Template 1: Complete Module Implementation

### Domain Entity Template

```csharp
// Asala.Core/Modules/{ModuleName}/Models/{EntityName}.cs
using Asala.Core.Common.Models;

namespace Asala.Core.Modules.{ModuleName}.Models;

public class {EntityName} : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsVisible { get; set; } = true;
    
    // Add your specific properties here
    // public decimal Price { get; set; }
    // public DateTime ScheduledDate { get; set; }
    // public int CategoryId { get; set; }
    
    // Navigation properties (if needed)
    // public virtual Category Category { get; set; } = null!;
    // public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
```

### DTOs Template

```csharp
// Asala.Core/Modules/{ModuleName}/DTOs/{EntityName}Dto.cs
namespace Asala.Core.Modules.{ModuleName}.DTOs;

public class {EntityName}Dto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsVisible { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Add your specific properties here
}

public class Create{EntityName}Dto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsVisible { get; set; } = true;
    
    // Add your specific properties here
}

public class Update{EntityName}Dto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsVisible { get; set; }
    public bool IsActive { get; set; }
    
    // Add your specific properties here
}

public class {EntityName}DropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
```

### Entity Configuration Template

```csharp
// Asala.Core/Db/Configurations/{EntityName}Configuration.cs
using Asala.Core.Modules.{ModuleName}.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class {EntityName}Configuration : BaseEntityConfiguration<{EntityName}, int>
{
    public override void Configure(EntityTypeBuilder<{EntityName}> builder)
    {
        base.Configure(builder); // Configures BaseEntity properties
        
        builder.ToTable("{EntityName}s");
        
        // Required properties
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);
            
        // Optional properties
        builder.Property(e => e.IsVisible)
            .HasDefaultValue(true);
            
        // Decimal properties (if needed)
        // builder.Property(e => e.Price)
        //     .HasColumnType("decimal(18,2)");
            
        // DateTime properties (if needed)
        // builder.Property(e => e.ScheduledDate)
        //     .HasColumnType("datetime");
            
        // Foreign keys (if needed)
        // builder.HasOne(e => e.Category)
        //     .WithMany(c => c.{EntityName}s)
        //     .HasForeignKey(e => e.CategoryId)
        //     .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes for performance
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.IsVisible);
    }
}
```

### Repository Interface Template

```csharp
// Asala.Core/Modules/{ModuleName}/Db/I{EntityName}Repository.cs
using Asala.Core.Common.Abstractions;
using Asala.Core.Modules.{ModuleName}.Models;

namespace Asala.Core.Modules.{ModuleName}.Db;

public interface I{EntityName}Repository : IRepository<{EntityName}, int>
{
    // Add custom repository methods here if needed
    // Example:
    // Task<Result<{EntityName}?>> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    // Task<Result<IEnumerable<{EntityName}>>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
}
```

### Repository Implementation Template

```csharp
// Asala.Core/Modules/{ModuleName}/Db/{EntityName}Repository.cs
using Asala.Core.Db.Contexts;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.{ModuleName}.Models;

namespace Asala.Core.Modules.{ModuleName}.Db;

public class {EntityName}Repository : Repository<{EntityName}, int>, I{EntityName}Repository
{
    public {EntityName}Repository(AsalaDbContext context) : base(context)
    {
    }
    
    // Implement custom methods here if needed
    // Example:
    // public async Task<Result<{EntityName}?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    // {
    //     try
    //     {
    //         var entity = await _dbSet
    //             .Where(e => !e.IsDeleted)
    //             .FirstOrDefaultAsync(e => e.Name.ToLower() == name.ToLower(), cancellationToken);
    //
    //         return Result.Success(entity);
    //     }
    //     catch (Exception ex)
    //     {
    //         return Result.Failure<{EntityName}?>(MessageCodes.DB_ERROR, ex);
    //     }
    // }
}
```

### Service Interface Template

```csharp
// Asala.UseCases/{ModuleName}/I{EntityName}Service.cs
using Asala.Core.Common.Models;
using Asala.Core.Modules.{ModuleName}.DTOs;

namespace Asala.UseCases.{ModuleName};

public interface I{EntityName}Service
{
    Task<Result<PaginatedResult<{EntityName}Dto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        bool visibleOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<{EntityName}Dto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<{EntityName}Dto>> CreateAsync(
        Create{EntityName}Dto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<{EntityName}Dto?>> UpdateAsync(
        int id,
        Update{EntityName}Dto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result<IEnumerable<{EntityName}DropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        bool visibleOnly = true,
        CancellationToken cancellationToken = default
    );
}
```

### Service Implementation Template

```csharp
// Asala.UseCases/{ModuleName}/{EntityName}Service.cs
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.{ModuleName}.Models;
using Asala.Core.Modules.{ModuleName}.DTOs;
using Asala.Core.Modules.{ModuleName}.Db;

namespace Asala.UseCases.{ModuleName};

public class {EntityName}Service : I{EntityName}Service
{
    private readonly I{EntityName}Repository _{entityName}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public {EntityName}Service(I{EntityName}Repository {entityName}Repository, IUnitOfWork unitOfWork)
    {
        _{entityName}Repository = {entityName}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<{EntityName}Dto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        bool visibleOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<{EntityName}, bool>> filter = BuildFilter(activeOnly, visibleOnly);

        var result = await _{entityName}Repository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(x => x.Name)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<{EntityName}Dto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<{EntityName}Dto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<{EntityName}Dto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(idValidationResult.MessageCode);

        var result = await _{entityName}Repository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<{EntityName}Dto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<{EntityName}Dto>> CreateAsync(
        Create{EntityName}Dto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreate{EntityName}Dto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<{EntityName}Dto>(validationResult.MessageCode);

        var {entityName} = new {EntityName}
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description.Trim(),
            IsVisible = createDto.IsVisible,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var addResult = await _{entityName}Repository.AddAsync({entityName}, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<{EntityName}Dto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<{EntityName}Dto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<{EntityName}Dto?>> UpdateAsync(
        int id,
        Update{EntityName}Dto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdate{EntityName}Dto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(validationResult.MessageCode);

        var getResult = await _{entityName}Repository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(getResult.MessageCode);

        var {entityName} = getResult.Value;
        if ({entityName} == null)
            return Result.Success<{EntityName}Dto?>(null);

        {entityName}.Name = updateDto.Name.Trim();
        {entityName}.Description = updateDto.Description.Trim();
        {entityName}.IsVisible = updateDto.IsVisible;
        {entityName}.IsActive = updateDto.IsActive;
        {entityName}.UpdatedAt = DateTime.UtcNow;

        var updateResult = _{entityName}Repository.Update({entityName});
        if (updateResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<{EntityName}Dto?>(saveResult.MessageCode);

        var dto = MapToDto({entityName});
        return Result.Success<{EntityName}Dto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _{entityName}Repository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var {entityName} = getResult.Value;
        if ({entityName} == null)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NOT_FOUND);

        {entityName}.IsDeleted = true;
        {entityName}.DeletedAt = DateTime.UtcNow;
        {entityName}.UpdatedAt = DateTime.UtcNow;

        var updateResult = _{entityName}Repository.Update({entityName});
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _{entityName}Repository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var {entityName} = getResult.Value;
        if ({entityName} == null)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NOT_FOUND);

        {entityName}.IsActive = !{entityName}.IsActive;
        {entityName}.UpdatedAt = DateTime.UtcNow;

        var updateResult = _{entityName}Repository.Update({entityName});
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<{EntityName}DropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        bool visibleOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<{EntityName}, bool>> filter = BuildFilter(activeOnly, visibleOnly);

        var result = await _{entityName}Repository.GetAsync(
            filter: filter,
            orderBy: q => q.OrderBy(x => x.Name)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<{EntityName}DropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<{EntityName}DropdownDto>>(dtos);
    }

    #region Private Helper Methods

    private static Expression<Func<{EntityName}, bool>> BuildFilter(bool activeOnly, bool visibleOnly)
    {
        return x => !x.IsDeleted &&
                    (!activeOnly || x.IsActive) &&
                    (!visibleOnly || x.IsVisible);
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreate{EntityName}Dto(Create{EntityName}Dto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NAME_REQUIRED);

        if (createDto.Name.Length > 200)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NAME_TOO_LONG);

        // Validate Description
        if (string.IsNullOrWhiteSpace(createDto.Description))
            return Result.Failure(MessageCodes.{ENTITY_NAME}_DESCRIPTION_REQUIRED);

        if (createDto.Description.Length > 1000)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_DESCRIPTION_TOO_LONG);

        return Result.Success();
    }

    private static Result ValidateUpdate{EntityName}Dto(Update{EntityName}Dto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Same validations as Create
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NAME_REQUIRED);

        if (updateDto.Name.Length > 200)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_NAME_TOO_LONG);

        if (string.IsNullOrWhiteSpace(updateDto.Description))
            return Result.Failure(MessageCodes.{ENTITY_NAME}_DESCRIPTION_REQUIRED);

        if (updateDto.Description.Length > 1000)
            return Result.Failure(MessageCodes.{ENTITY_NAME}_DESCRIPTION_TOO_LONG);

        return Result.Success();
    }

    #endregion

    #region Mapping Methods

    private static {EntityName}Dto MapToDto({EntityName} {entityName})
    {
        return new {EntityName}Dto
        {
            Id = {entityName}.Id,
            Name = {entityName}.Name,
            Description = {entityName}.Description,
            IsVisible = {entityName}.IsVisible,
            IsActive = {entityName}.IsActive,
            CreatedAt = {entityName}.CreatedAt,
            UpdatedAt = {entityName}.UpdatedAt,
        };
    }

    private static {EntityName}DropdownDto MapToDropdownDto({EntityName} {entityName})
    {
        return new {EntityName}DropdownDto
        {
            Id = {entityName}.Id,
            Name = {entityName}.Name,
        };
    }

    #endregion
}
```

### Controller Template

```csharp
// Asala.Api/Controllers/{EntityName}Controller.cs
using Asala.Core.Modules.{ModuleName}.DTOs;
using Asala.UseCases.{ModuleName};
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/{entityName}s")]
public class {EntityName}Controller : BaseController
{
    private readonly I{EntityName}Service _{entityName}Service;

    public {EntityName}Controller(I{EntityName}Service {entityName}Service)
        : base()
    {
        _{entityName}Service = {entityName}Service;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool visibleOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            visibleOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool visibleOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.GetDropdownAsync(activeOnly, visibleOnly, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] Create{EntityName}Dto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] Update{EntityName}Dto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _{entityName}Service.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
```

---

## Template 2: Dependency Registration

### Add to ServiceCollectionExtensions

```csharp
// Asala.Core/Common/Extensions/ServiceCollectionExtensions.cs
public static IServiceCollection AddModuleRepositories(this IServiceCollection services)
{
    services.AddScoped<ILanguageRepository, LanguageRepository>();
    services.AddScoped<I{EntityName}Repository, {EntityName}Repository>(); // Add this line
    return services;
}
```

```csharp
// Asala.UseCases/Extensions/ServiceCollectionExtensions.cs  
public static IServiceCollection AddUseCases(this IServiceCollection services)
{
    services.AddScoped<ILanguageService, LanguageService>();
    services.AddScoped<I{EntityName}Service, {EntityName}Service>(); // Add this line
    return services;
}
```

### Add to DbContext

```csharp
// Asala.Core/Db/Contexts/AsalaDbContext.cs
public class AsalaDbContext : DbContext
{
    // Existing DbSets
    public DbSet<Language> Languages { get; set; } = null!;
    public DbSet<{EntityName}> {EntityName}s { get; set; } = null!; // Add this line

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Existing configurations
        modelBuilder.ApplyConfiguration(new LanguageConfiguration());
        modelBuilder.ApplyConfiguration(new {EntityName}Configuration()); // Add this line
    }
}
```

---

## Template 3: Message Codes

Add to your MessageCodes class:

```csharp
// Asala.Core/Common/Models/MessageCodes.cs
public static class MessageCodes
{
    // Existing codes...
    
    // {EntityName} specific codes
    public const string {ENTITY_NAME}_NOT_FOUND = "{ENTITY_NAME}_NOT_FOUND";
    public const string {ENTITY_NAME}_ID_INVALID = "{ENTITY_NAME}_ID_INVALID";
    public const string {ENTITY_NAME}_NAME_REQUIRED = "{ENTITY_NAME}_NAME_REQUIRED";
    public const string {ENTITY_NAME}_NAME_TOO_LONG = "{ENTITY_NAME}_NAME_TOO_LONG";
    public const string {ENTITY_NAME}_DESCRIPTION_REQUIRED = "{ENTITY_NAME}_DESCRIPTION_REQUIRED";
    public const string {ENTITY_NAME}_DESCRIPTION_TOO_LONG = "{ENTITY_NAME}_DESCRIPTION_TOO_LONG";
    public const string {ENTITY_NAME}_ALREADY_EXISTS = "{ENTITY_NAME}_ALREADY_EXISTS";
}
```

---

## Template 4: Migration Commands

```bash
# Create migration (replace {MigrationName} with descriptive name)
dotnet ef migrations add Add{EntityName} --project Asala.Api --startup-project Asala.Api

# Review the generated migration file before applying
# Apply the migration
dotnet ef database update --project Asala.Api --startup-project Asala.Api

# If you need to remove the last migration (before applying to database)
dotnet ef migrations remove --project Asala.Api --startup-project Asala.Api
```

---

## Template 5: API Testing Examples

### Using curl

```bash
# Get paginated records
curl "https://localhost:5001/api/{entityName}s?page=1&pageSize=10&activeOnly=true&visibleOnly=true"

# Get by ID
curl "https://localhost:5001/api/{entityName}s/1"

# Get dropdown
curl "https://localhost:5001/api/{entityName}s/dropdown?activeOnly=true&visibleOnly=true"

# Create new record
curl -X POST "https://localhost:5001/api/{entityName}s" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Sample Name",
       "description": "Sample Description",
       "isVisible": true
     }'

# Update record
curl -X PUT "https://localhost:5001/api/{entityName}s/1" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Name",
       "description": "Updated Description",
       "isVisible": true,
       "isActive": true
     }'

# Toggle activation
curl -X PUT "https://localhost:5001/api/{entityName}s/1/toggle-activation"

# Soft delete
curl -X DELETE "https://localhost:5001/api/{entityName}s/1"
```

### Using JavaScript/Fetch

```javascript
// API client class
class {EntityName}ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getPaginated(page = 1, pageSize = 10, activeOnly = true, visibleOnly = true) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            activeOnly: activeOnly.toString(),
            visibleOnly: visibleOnly.toString()
        });

        const response = await fetch(`${this.baseUrl}/api/{entityName}s?${params}`);
        return await response.json();
    }

    async getById(id) {
        const response = await fetch(`${this.baseUrl}/api/{entityName}s/${id}`);
        return await response.json();
    }

    async getDropdown(activeOnly = true, visibleOnly = true) {
        const params = new URLSearchParams({
            activeOnly: activeOnly.toString(),
            visibleOnly: visibleOnly.toString()
        });

        const response = await fetch(`${this.baseUrl}/api/{entityName}s/dropdown?${params}`);
        return await response.json();
    }

    async create(data) {
        const response = await fetch(`${this.baseUrl}/api/{entityName}s`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async update(id, data) {
        const response = await fetch(`${this.baseUrl}/api/{entityName}s/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async toggleActivation(id) {
        const response = await fetch(`${this.baseUrl}/api/{entityName}s/${id}/toggle-activation`, {
            method: 'PUT'
        });
        return await response.json();
    }

    async softDelete(id) {
        const response = await fetch(`${this.baseUrl}/api/{entityName}s/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
}

// Usage example
const client = new {EntityName}ApiClient('https://localhost:5001');

// Load data
const result = await client.getPaginated(1, 20);
if (result.isSuccess) {
    console.log('Data:', result.data.items);
} else {
    console.error('Error:', result.messageCode);
}
```

---

## Template 6: Unit Test Examples

```csharp
// Test class template
using Moq;
using NUnit.Framework;
using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.{ModuleName}.Models;
using Asala.Core.Modules.{ModuleName}.DTOs;
using Asala.Core.Modules.{ModuleName}.Db;
using Asala.UseCases.{ModuleName};

namespace Asala.Tests.UseCases.{ModuleName};

[TestFixture]
public class {EntityName}ServiceTests
{
    private Mock<I{EntityName}Repository> _mockRepository;
    private Mock<IUnitOfWork> _mockUnitOfWork;
    private {EntityName}Service _{entityName}Service;

    [SetUp]
    public void SetUp()
    {
        _mockRepository = new Mock<I{EntityName}Repository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _{entityName}Service = new {EntityName}Service(_mockRepository.Object, _mockUnitOfWork.Object);
    }

    [Test]
    public async Task CreateAsync_WithValidDto_ShouldReturnSuccess()
    {
        // Arrange
        var createDto = new Create{EntityName}Dto
        {
            Name = "Test {EntityName}",
            Description = "Test Description",
            IsVisible = true
        };

        var created{EntityName} = new {EntityName}
        {
            Id = 1,
            Name = createDto.Name,
            Description = createDto.Description,
            IsVisible = createDto.IsVisible,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<{EntityName}>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(Result.Success(created{EntityName}));
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
                       .ReturnsAsync(Result.Success());

        // Act
        var result = await _{entityName}Service.CreateAsync(createDto, CancellationToken.None);

        // Assert
        Assert.IsTrue(result.IsSuccess);
        Assert.IsNotNull(result.Value);
        Assert.AreEqual(createDto.Name, result.Value.Name);
        Assert.AreEqual(createDto.Description, result.Value.Description);
    }

    [Test]
    public async Task CreateAsync_WithNullDto_ShouldReturnFailure()
    {
        // Act
        var result = await _{entityName}Service.CreateAsync(null, CancellationToken.None);

        // Assert
        Assert.IsTrue(result.IsFailure);
        Assert.AreEqual(MessageCodes.ENTITY_NULL, result.MessageCode);
    }

    [Test]
    public async Task GetByIdAsync_WithValidId_ShouldReturnSuccess()
    {
        // Arrange
        var {entityName} = new {EntityName}
        {
            Id = 1,
            Name = "Test {EntityName}",
            Description = "Test Description",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                      .ReturnsAsync(Result.Success({entityName}));

        // Act
        var result = await _{entityName}Service.GetByIdAsync(1, CancellationToken.None);

        // Assert
        Assert.IsTrue(result.IsSuccess);
        Assert.IsNotNull(result.Value);
        Assert.AreEqual(1, result.Value.Id);
        Assert.AreEqual("Test {EntityName}", result.Value.Name);
    }

    [Test]
    public async Task GetByIdAsync_WithInvalidId_ShouldReturnFailure()
    {
        // Act
        var result = await _{entityName}Service.GetByIdAsync(0, CancellationToken.None);

        // Assert
        Assert.IsTrue(result.IsFailure);
        Assert.AreEqual(MessageCodes.{ENTITY_NAME}_ID_INVALID, result.MessageCode);
    }
}
```

---

## How to Use These Templates

1. **Replace Placeholders:**
   - `{ModuleName}` → Your module name (e.g., "Products", "Categories")
   - `{EntityName}` → Your entity name (e.g., "Product", "Category")
   - `{entityName}` → Lowercase entity name (e.g., "product", "category")
   - `{ENTITY_NAME}` → Uppercase entity name for constants (e.g., "PRODUCT", "CATEGORY")

2. **Customize Properties:**
   - Add your specific entity properties
   - Modify validation rules
   - Adjust business logic as needed

3. **Follow the Implementation Order:**
   - Start with entity and DTOs
   - Create repository and service
   - Add controller
   - Register dependencies
   - Create migration
   - Test endpoints

4. **Test Thoroughly:**
   - Use the provided test templates
   - Test both success and failure scenarios
   - Validate error handling

## Quick Implementation Script

For faster development, consider creating a PowerShell or bash script that:
1. Takes module and entity names as parameters
2. Generates all files from templates
3. Replaces placeholders automatically
4. Creates the basic folder structure

This can reduce implementation time from hours to minutes for standard CRUD operations.

## Related Documentation

- [Architecture Overview](./architecture-overview.md)
- [API Development Guide](./api-development-guide.md)
- [Language Controller API Reference](./language-controller-api-reference.md)
- [Best Practices](./best-practices.md)
