# Best Practices & Coding Standards

## Overview

This document outlines the coding standards, best practices, and conventions used in the Asala project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## General Principles

### 1. SOLID Principles
- **Single Responsibility**: Each class should have only one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Many client-specific interfaces are better than one general-purpose interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### 2. Clean Code Principles
- Write code that is easy to read and understand
- Use meaningful names for variables, methods, and classes
- Keep methods and classes small and focused
- Avoid deep nesting and complex conditions
- Write self-documenting code with clear intent

## Architecture Best Practices

### 1. Layer Separation

**DO:**
```csharp
// Controller only handles HTTP concerns
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateLanguageDto dto)
{
    var result = await _languageService.CreateAsync(dto, cancellationToken);
    return CreateResponse(result);
}
```

**DON'T:**
```csharp
// Don't put business logic in controllers
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateLanguageDto dto)
{
    // ❌ Business logic in controller
    if (string.IsNullOrEmpty(dto.Name))
        return BadRequest("Name is required");
    
    var entity = new Language { Name = dto.Name };
    _context.Languages.Add(entity);
    await _context.SaveChangesAsync();
    return Ok(entity);
}
```

### 2. Dependency Injection

**DO:**
```csharp
// Use constructor injection
public class LanguageService : ILanguageService
{
    private readonly ILanguageRepository _languageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LanguageService(ILanguageRepository languageRepository, IUnitOfWork unitOfWork)
    {
        _languageRepository = languageRepository;
        _unitOfWork = unitOfWork;
    }
}
```

**DON'T:**
```csharp
// Don't use service locator pattern
public class LanguageService : ILanguageService
{
    public async Task<Result> CreateAsync(CreateLanguageDto dto)
    {
        // ❌ Service locator anti-pattern
        var repository = ServiceLocator.Get<ILanguageRepository>();
    }
}
```

### 3. Error Handling

**DO:**
```csharp
// Use Result pattern for error handling
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto dto)
{
    var validationResult = ValidateDto(dto);
    if (validationResult.IsFailure)
        return Result.Failure<LanguageDto>(validationResult.MessageCode);

    // ... business logic
    
    return Result.Success(languageDto);
}
```

**DON'T:**
```csharp
// Don't throw exceptions for business logic errors
public async Task<LanguageDto> CreateAsync(CreateLanguageDto dto)
{
    if (string.IsNullOrEmpty(dto.Name))
        throw new ArgumentException("Name is required"); // ❌ Exception for business rule
    
    // ...
}
```

## Coding Standards

### 1. Naming Conventions

#### Classes and Interfaces
```csharp
// Classes: PascalCase
public class LanguageService { }
public class ProductRepository { }

// Interfaces: I + PascalCase
public interface ILanguageService { }
public interface IProductRepository { }

// Abstract classes: PascalCase
public abstract class BaseEntity<T> { }
public abstract class BaseController { }
```

#### Methods and Properties
```csharp
// Methods: PascalCase with descriptive verbs
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto dto) { }
public async Task<Result> ToggleActivationAsync(int id) { }

// Properties: PascalCase
public string Name { get; set; }
public bool IsActive { get; set; }
public DateTime CreatedAt { get; set; }
```

#### Variables and Parameters
```csharp
// Local variables and parameters: camelCase
public async Task<Result> ProcessAsync(CreateLanguageDto createDto, CancellationToken cancellationToken)
{
    var validationResult = ValidateDto(createDto);
    var languageEntity = MapToEntity(createDto);
    // ...
}
```

#### Constants
```csharp
// Constants: UPPER_SNAKE_CASE
public const string DEFAULT_LANGUAGE_CODE = "en";
public const int MAX_PAGE_SIZE = 100;
```

### 2. File Organization

#### Folder Structure
```
Asala.Core/
├── Common/
│   ├── Abstractions/      # Interfaces
│   ├── Extensions/        # Extension methods
│   └── Models/           # Shared models
├── Db/
│   ├── Configurations/   # EF configurations
│   ├── Contexts/         # DbContext
│   └── Repositories/     # Generic repositories
└── Modules/
    └── {ModuleName}/
        ├── Models/       # Domain entities
        ├── DTOs/         # Data transfer objects
        └── Db/          # Module-specific repositories
```

#### File Naming
- Use PascalCase for file names
- Match file names with class names
- Use descriptive, specific names

### 3. Method Organization

#### Method Structure
```csharp
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto createDto, CancellationToken cancellationToken = default)
{
    // 1. Input validation
    var validationResult = ValidateCreateDto(createDto);
    if (validationResult.IsFailure)
        return Result.Failure<LanguageDto>(validationResult.MessageCode);

    // 2. Business logic
    var normalizedCode = createDto.Code.Trim().ToLowerInvariant();
    
    var existsResult = await CheckIfExistsAsync(normalizedCode, cancellationToken);
    if (existsResult.IsFailure)
        return Result.Failure<LanguageDto>(existsResult.MessageCode);

    // 3. Data operations
    var language = MapToEntity(createDto, normalizedCode);
    var addResult = await _repository.AddAsync(language, cancellationToken);
    if (addResult.IsFailure)
        return Result.Failure<LanguageDto>(addResult.MessageCode);

    // 4. Persistence
    var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
    if (saveResult.IsFailure)
        return Result.Failure<LanguageDto>(saveResult.MessageCode);

    // 5. Return result
    var dto = MapToDto(addResult.Value);
    return Result.Success(dto);
}
```

### 4. Async/Await Guidelines

**DO:**
```csharp
// Always use async/await for database operations
public async Task<Result<IEnumerable<LanguageDto>>> GetAllAsync(CancellationToken cancellationToken = default)
{
    var result = await _repository.GetAllAsync(cancellationToken);
    // ...
}

// Pass CancellationToken through the call chain
public async Task<Result> ProcessAsync(CancellationToken cancellationToken = default)
{
    var result = await _repository.GetAsync(cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);
}
```

**DON'T:**
```csharp
// Don't mix sync and async code
public async Task<Result> ProcessAsync()
{
    var result = _repository.GetAll(); // ❌ Sync call in async method
    // ...
}

// Don't forget CancellationToken
public async Task<Result> ProcessAsync()
{
    var result = await _repository.GetAllAsync(); // ❌ Missing CancellationToken
}
```

## Data Access Best Practices

### 1. Repository Pattern

**DO:**
```csharp
// Use generic repository for common operations
public class LanguageRepository : Repository<Language, int>, ILanguageRepository
{
    public LanguageRepository(AsalaDbContext context) : base(context)
    {
    }
    
    // Only add custom methods when needed
    public async Task<Result<Language?>> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        // Custom implementation
    }
}
```

**DON'T:**
```csharp
// Don't bypass repository pattern
public class LanguageService
{
    private readonly AsalaDbContext _context; // ❌ Direct DbContext access
    
    public async Task<Result> CreateAsync(CreateLanguageDto dto)
    {
        _context.Languages.Add(new Language()); // ❌ Direct DbContext usage
    }
}
```

### 2. Entity Framework Best Practices

**DO:**
```csharp
// Use proper configurations
public class LanguageConfiguration : BaseEntityConfiguration<Language, int>
{
    public override void Configure(EntityTypeBuilder<Language> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("Languages");
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(10);
        
        // Add indexes for performance
        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
    }
}
```

**DON'T:**
```csharp
// Don't use magic strings or ignore configurations
public class Language
{
    [Required, StringLength(100)] // ❌ Data annotations instead of Fluent API
    public string Name { get; set; }
}
```

## Service Layer Best Practices

### 1. Validation

**DO:**
```csharp
private static Result ValidateCreateLanguageDto(CreateLanguageDto dto)
{
    if (dto == null)
        return Result.Failure(MessageCodes.ENTITY_NULL);

    if (string.IsNullOrWhiteSpace(dto.Name))
        return Result.Failure(MessageCodes.LANGUAGE_NAME_REQUIRED);

    if (dto.Name.Length > 100)
        return Result.Failure(MessageCodes.LANGUAGE_NAME_TOO_LONG);

    if (!Regex.IsMatch(dto.Code.Trim(), @"^[a-z]{2,5}$"))
        return Result.Failure(MessageCodes.LANGUAGE_CODE_INVALID_FORMAT);

    return Result.Success();
}
```

**DON'T:**
```csharp
// Don't skip validation or use generic messages
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto dto)
{
    // ❌ No validation
    var language = new Language { Name = dto.Name, Code = dto.Code };
    
    // or ❌ Generic error messages
    if (string.IsNullOrEmpty(dto.Name))
        return Result.Failure<LanguageDto>("Invalid input");
}
```

### 2. Mapping

**DO:**
```csharp
// Create dedicated mapping methods
private static LanguageDto MapToDto(Language language)
{
    return new LanguageDto
    {
        Id = language.Id,
        Name = language.Name,
        Code = language.Code,
        IsActive = language.IsActive,
        CreatedAt = language.CreatedAt,
        UpdatedAt = language.UpdatedAt,
    };
}

// Or consider AutoMapper for complex scenarios
```

**DON'T:**
```csharp
// Don't do inline mapping in business logic
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto dto)
{
    // ... business logic ...
    
    // ❌ Inline mapping clutters business logic
    return Result.Success(new LanguageDto
    {
        Id = language.Id,
        Name = language.Name,
        // ... many properties
    });
}
```

## API Controller Best Practices

### 1. Controller Structure

**DO:**
```csharp
[ApiController]
[Route("api/languages")]
public class LanguageController : BaseController
{
    private readonly ILanguageService _languageService;

    public LanguageController(ILanguageService languageService) : base()
    {
        _languageService = languageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _languageService.GetPaginatedAsync(page, pageSize, activeOnly, cancellationToken);
        return CreateResponse(result);
    }
}
```

### 2. Parameter Binding

**DO:**
```csharp
// Use proper parameter binding attributes
[HttpGet]
public async Task<IActionResult> GetPaginated(
    [FromQuery] int page = 1,           // Query parameters
    [FromQuery] int pageSize = 10
)

[HttpPost]
public async Task<IActionResult> Create(
    [FromBody] CreateLanguageDto dto    // Request body
)

[HttpPut("{id}")]
public async Task<IActionResult> Update(
    int id,                             // Route parameter
    [FromBody] UpdateLanguageDto dto    // Request body
)
```

## Testing Best Practices

### 1. Unit Test Structure

**DO:**
```csharp
[Test]
public async Task CreateAsync_WithValidDto_ShouldReturnSuccess()
{
    // Arrange
    var createDto = new CreateLanguageDto
    {
        Name = "Spanish",
        Code = "es"
    };
    
    _mockRepository.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<Language, bool>>>(), It.IsAny<CancellationToken>()))
                   .ReturnsAsync(Result.Success(false));
    
    // Act
    var result = await _languageService.CreateAsync(createDto, CancellationToken.None);
    
    // Assert
    Assert.IsTrue(result.IsSuccess);
    Assert.AreEqual("Spanish", result.Value.Name);
}
```

### 2. Test Naming
- Use descriptive test names: `MethodName_Scenario_ExpectedResult`
- Examples:
  - `CreateAsync_WithValidDto_ShouldReturnSuccess`
  - `CreateAsync_WithDuplicateCode_ShouldReturnFailure`
  - `GetPaginatedAsync_WithInvalidPage_ShouldReturnError`

## Performance Best Practices

### 1. Database Queries

**DO:**
```csharp
// Use appropriate filtering and indexing
Expression<Func<Language, bool>> filter = activeOnly
    ? l => l.IsActive && !l.IsDeleted
    : l => !l.IsDeleted;

var result = await _repository.GetPaginatedAsync(
    page,
    pageSize,
    filter: filter,
    orderBy: q => q.OrderBy(l => l.Name)
);
```

### 2. Async Operations

**DO:**
```csharp
// Use async operations for I/O bound work
public async Task<Result<LanguageDto>> CreateAsync(CreateLanguageDto dto, CancellationToken cancellationToken)
{
    var existsResult = await _repository.AnyAsync(l => l.Code == dto.Code, cancellationToken);
    var addResult = await _repository.AddAsync(language, cancellationToken);
    var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
    
    return Result.Success(MapToDto(addResult.Value));
}
```

## Security Best Practices

### 1. Input Validation
- Always validate input at the service layer
- Use whitelisting instead of blacklisting
- Sanitize user input before processing

### 2. SQL Injection Prevention
- Use parameterized queries (handled by Entity Framework)
- Never concatenate user input into SQL strings
- Validate and sanitize dynamic query conditions

## Documentation Standards

### 1. Code Comments
```csharp
/// <summary>
/// Creates a new language with validation and duplicate checking
/// </summary>
/// <param name="createDto">Language creation data</param>
/// <param name="cancellationToken">Cancellation token for async operation</param>
/// <returns>Result containing the created language DTO or error information</returns>
public async Task<Result<LanguageDto>> CreateAsync(
    CreateLanguageDto createDto,
    CancellationToken cancellationToken = default
)
```

### 2. README Files
- Include setup instructions
- Provide API usage examples
- Document architectural decisions

## Common Pitfalls to Avoid

### 1. Anti-Patterns

❌ **God Classes**: Classes that do too much
❌ **Magic Numbers**: Hardcoded values without constants
❌ **Long Parameter Lists**: Methods with too many parameters
❌ **Primitive Obsession**: Using primitives instead of value objects
❌ **Copy-Paste Programming**: Duplicating code instead of refactoring

### 2. Performance Issues

❌ **N+1 Queries**: Multiple database queries in loops
❌ **Missing Indexes**: Queries on unindexed columns
❌ **Synchronous I/O**: Using blocking calls for async operations
❌ **Memory Leaks**: Not disposing resources properly

## Conclusion

Following these best practices ensures:
- Consistent code quality across the team
- Better maintainability and readability
- Improved performance and security
- Easier testing and debugging
- Smoother onboarding for new developers

Remember: These are guidelines, not rigid rules. Use good judgment and consider the specific context of your implementation.

## Related Documentation

- [Architecture Overview](./architecture-overview.md)
- [API Development Guide](./api-development-guide.md)
- [Language Controller API Reference](./language-controller-api-reference.md)
- [Code Examples](./code-examples.md)
