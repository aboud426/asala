# Asala Project API Documentation

Welcome to the comprehensive API documentation for the Asala project. This documentation will help developers understand the architecture and implement new features following established patterns.

## 🚀 Quick Start

If you're new to the project or need to implement a new feature quickly:

1. **Start here**: [Architecture Overview](./architecture-overview.md) - Understand the overall system design
2. **Follow the guide**: [API Development Guide](./api-development-guide.md) - Step-by-step implementation process
3. **Use templates**: [Code Examples](./code-examples.md) - Ready-to-use templates and code samples
4. **Follow standards**: [Best Practices](./best-practices.md) - Coding standards and guidelines

## 📚 Documentation Structure

### Core Documentation

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| [Architecture Overview](./architecture-overview.md) | High-level system architecture and design patterns | All developers, architects |
| [API Development Guide](./api-development-guide.md) | Step-by-step guide to implement new features | Developers implementing new APIs |
| [Best Practices](./best-practices.md) | Coding standards, conventions, and guidelines | All developers |
| [Code Examples](./code-examples.md) | Templates, examples, and boilerplate code | Developers seeking quick implementation |

### Reference Documentation

| Document | Purpose | Target Audience |
|----------|---------|-----------------|
| [Language Controller API Reference](./language-controller-api-reference.md) | Complete API documentation for Language endpoints | Frontend developers, API consumers |

## 🏗️ Architecture Overview

The Asala project follows **Clean Architecture** principles with three main layers:

```
┌─────────────────────┐
│   Asala.Api         │ ←─── Presentation Layer (Controllers)
│   (HTTP/REST)       │
└─────────────────────┘
          ↓
┌─────────────────────┐
│   Asala.UseCases    │ ←─── Application Layer (Business Logic)
│   (Services)        │
└─────────────────────┘
          ↓
┌─────────────────────┐
│   Asala.Core        │ ←─── Domain Layer (Entities, Data Access)
│   (Entities/Repos)  │
└─────────────────────┘
```

### Key Patterns Used

- **Repository Pattern**: Abstraction over data access
- **Unit of Work Pattern**: Transaction management and data consistency
- **Result Pattern**: Consistent error handling without exceptions
- **Service Layer Pattern**: Business logic encapsulation
- **DTO Pattern**: Data transfer and API contracts

## 🛠️ Implementation Workflow

### For New Features

1. **Plan the Feature**
   - Define requirements
   - Identify entities and relationships
   - Design API endpoints

2. **Follow the Architecture**
   - Create domain entity
   - Define DTOs
   - Implement repository
   - Create service with business logic
   - Add controller for API endpoints

3. **Register Dependencies**
   - Add to dependency injection
   - Update database context
   - Create and run migrations

4. **Test and Document**
   - Test all endpoints
   - Validate error scenarios
   - Update API documentation

### For Existing Features

1. **Understand Current Implementation**
   - Review existing code
   - Follow established patterns
   - Maintain consistency

2. **Make Changes Carefully**
   - Update service layer for business logic
   - Modify controller for API changes
   - Update DTOs if needed

3. **Test Thoroughly**
   - Ensure backward compatibility
   - Test all affected endpoints
   - Validate error handling

## 📋 Development Standards

### Code Quality
- ✅ Follow established naming conventions
- ✅ Use Result pattern for error handling
- ✅ Implement proper validation
- ✅ Write descriptive commit messages
- ✅ Add inline documentation for complex logic

### API Standards
- ✅ RESTful endpoint design
- ✅ Consistent response format
- ✅ Proper HTTP status codes (always 200 with error details in body)
- ✅ Pagination for list endpoints
- ✅ Support for filtering and sorting

### Database Standards
- ✅ Use Entity Framework migrations
- ✅ Proper entity configurations
- ✅ Soft delete implementation
- ✅ Audit trail with timestamps
- ✅ Appropriate indexes for performance

## 📖 API Reference

### Language API
The Language Controller serves as the reference implementation for all APIs in the project. It demonstrates:

- **Complete CRUD operations**
- **Pagination and filtering**
- **Proper error handling**
- **Consistent response format**
- **Validation and business rules**

See the [Language Controller API Reference](./language-controller-api-reference.md) for detailed endpoint documentation.

### Standard Endpoints Pattern

All entity controllers follow this pattern:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/{entity}s` | Get paginated list with filtering |
| GET | `/api/{entity}s/{id}` | Get single entity by ID |
| GET | `/api/{entity}s/dropdown` | Get simplified list for dropdowns |
| POST | `/api/{entity}s` | Create new entity |
| PUT | `/api/{entity}s/{id}` | Update existing entity |
| PUT | `/api/{entity}s/{id}/toggle-activation` | Toggle active status |
| DELETE | `/api/{entity}s/{id}` | Soft delete entity |

## 🔧 Development Tools

### Required Tools
- **.NET 6 or later**
- **Entity Framework Core CLI**
- **SQL Server** (or SQL Server Express)
- **IDE**: Visual Studio or VS Code

### Useful Commands

```bash
# Build the solution
dotnet build

# Run the API
dotnet run --project Asala.Api

# Create migration
dotnet ef migrations add MigrationName --project Asala.Api

# Update database
dotnet ef database update --project Asala.Api

# Remove last migration (if not applied)
dotnet ef migrations remove --project Asala.Api
```

## 🧪 Testing

### API Testing
- **Swagger UI**: Available at `/swagger` when running locally
- **Postman**: Use the provided examples in documentation
- **curl**: Command-line testing examples provided

### Unit Testing
- Follow the test templates in [Code Examples](./code-examples.md)
- Test both success and failure scenarios
- Mock dependencies properly
- Use descriptive test names

## 🆘 Troubleshooting

### Common Issues

**Migration Issues**
```bash
# Reset migrations (development only)
dotnet ef database drop --project Asala.Api
dotnet ef migrations remove --project Asala.Api
# Recreate migration
dotnet ef migrations add InitialCreate --project Asala.Api
dotnet ef database update --project Asala.Api
```

**Dependency Injection Issues**
- Ensure services are registered in `ServiceCollectionExtensions`
- Check interface and implementation naming
- Verify proper constructor injection

**Database Connection Issues**
- Check connection string in `appsettings.json`
- Ensure SQL Server is running
- Verify database permissions

## 📞 Getting Help

1. **Check Documentation**: Start with the relevant documentation section
2. **Review Examples**: Look at existing implementations (Language module)
3. **Follow Patterns**: Maintain consistency with established code
4. **Ask Questions**: Reach out to team members for clarification

## 🔄 Contributing

### Before Making Changes
1. Read the architecture overview
2. Understand the existing patterns
3. Follow the development guide
4. Check coding standards

### Making Changes
1. Create feature branch
2. Implement following established patterns
3. Test thoroughly
4. Update documentation if needed
5. Submit pull request

## 📝 Documentation Updates

This documentation should be updated when:
- New architectural patterns are introduced
- API endpoints are added or changed
- Business rules are modified
- New development tools or processes are adopted

---

## Quick Reference

| Need | Document |
|------|----------|
| Understand the system | [Architecture Overview](./architecture-overview.md) |
| Implement new feature | [API Development Guide](./api-development-guide.md) |
| Get code templates | [Code Examples](./code-examples.md) |
| Follow coding standards | [Best Practices](./best-practices.md) |
| API endpoint details | [Language Controller API Reference](./language-controller-api-reference.md) |

**Happy coding! 🎉**
