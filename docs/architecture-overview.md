# Asala Project Architecture Overview

## Introduction

This document provides a comprehensive overview of the Asala project architecture, which follows **Clean Architecture** principles with clear separation of concerns and dependency inversion.

## Architecture Layers

### 1. Presentation Layer (`Asala.Api`)
- **Purpose**: HTTP API endpoints and request/response handling
- **Components**:
  - Controllers (inherit from `BaseController`)
  - API models and response formatters
  - HTTP-specific configurations

### 2. Application Layer (`Asala.UseCases`)
- **Purpose**: Business logic and use cases implementation
- **Components**:
  - Service interfaces and implementations
  - Business logic validation
  - Orchestration of domain operations

### 3. Domain/Core Layer (`Asala.Core`)
- **Purpose**: Domain entities, business rules, and data access abstractions
- **Components**:
  - Domain entities (inheriting from `BaseEntity<T>`)
  - Repository interfaces and implementations
  - DTOs (Data Transfer Objects)
  - Database context and configurations
  - Common abstractions and utilities

## Key Architectural Patterns

### 1. Clean Architecture
```
┌─────────────────────┐
│   Asala.Api         │ ←─── Presentation Layer
│   (Controllers)     │
└─────────────────────┘
          ↓
┌─────────────────────┐
│   Asala.UseCases    │ ←─── Application Layer
│   (Services)        │
└─────────────────────┘
          ↓
┌─────────────────────┐
│   Asala.Core        │ ←─── Domain Layer
│   (Entities/Repos)  │
└─────────────────────┘
```

### 2. Repository Pattern
- Generic repository interface: `IRepository<TEntity, TPrimaryKey>`
- Entity-specific repositories: `ILanguageRepository`
- Provides abstraction over data access operations

### 3. Unit of Work Pattern
- `IUnitOfWork` manages transactions and coordinates repositories
- Ensures data consistency across multiple operations
- Provides centralized transaction management

### 4. Result Pattern
- `Result<T>` and `Result` classes for operation outcomes
- Consistent error handling across all layers
- Eliminates exception-based flow control

### 5. Dependency Injection
- All dependencies registered in `ServiceCollectionExtensions`
- Constructor injection throughout the application
- Interface-based dependencies for testability

## Core Components

### BaseEntity
All domain entities inherit from `BaseEntity<T>`:
```csharp
public abstract class BaseEntity<T>
{
    public T Id { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

### BaseController
All API controllers inherit from `BaseController`:
```csharp
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult CreateResponse(Result result);
    protected IActionResult CreateResponse<T>(Result<T> result);
}
```

### Service Layer Pattern
Services implement business logic and coordinate between repositories:
```csharp
public interface ILanguageService
{
    Task<Result<PaginatedResult<LanguageDto>>> GetPaginatedAsync(...);
    Task<Result<LanguageDto>> CreateAsync(...);
    // ... other operations
}
```

## Data Flow

### Request Flow
1. **HTTP Request** arrives at Controller
2. **Controller** validates input and calls Service
3. **Service** implements business logic and calls Repository
4. **Repository** performs data operations via Entity Framework
5. **Result** is returned back through the layers
6. **Controller** formats response using `CreateResponse()`

### Error Handling Flow
1. **Errors** are captured as `Result.Failure()` with message codes
2. **No exceptions** thrown for business logic errors
3. **Consistent responses** via `ApiResponseRepresenter`
4. **HTTP 200 OK** returned with error details in response body

## Database Strategy

### Entity Framework Core
- Code-First approach with migrations
- DbContext: `AsalaDbContext`
- Configurations in separate files (e.g., `LanguageConfiguration`)

### Soft Delete Pattern
- `IsDeleted` flag instead of physical deletion
- `DeletedAt` timestamp for audit trail
- Repository methods filter out deleted entities

### Audit Trail
- `CreatedAt`, `UpdatedAt` tracked automatically
- `DeletedAt` set during soft delete operations

## Dependency Registration

Services are registered in extension methods:

```csharp
// Asala.Core
services.AddDataAccess(configuration);    // Repositories, UoW, DbContext
services.AddModuleRepositories();         // Entity-specific repositories

// Asala.UseCases  
services.AddUseCases();                   // Business services
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has clear responsibilities
2. **Testability**: Interface-based design enables easy unit testing
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features following established patterns
5. **Consistency**: Standardized patterns across all modules
6. **Error Handling**: Consistent error handling via Result pattern

## Next Steps

- Review the [API Development Guide](./api-development-guide.md) to learn how to implement new features
- Check [Best Practices](./best-practices.md) for coding standards
- See [Code Examples](./code-examples.md) for templates and samples
