# GetBasePosts Query and Handler

This module provides paginated retrieval of BasePost entities with comprehensive filtering capabilities.

## Features

### Pagination

- Standard page-based pagination using `PaginatedResult<BasePostDto>`
- Configurable page size (1-100 items per page)
- Total count and metadata included in response

### Filtering Options

- **IsActive**: Filter by active/inactive status
- **UserId**: Filter posts by specific user
- **PostTypeId**: Filter by single post type
- **PostTypeIds**: Filter by multiple post types
- **Description**: Text search within post descriptions
- **CreatedAfter/CreatedBefore**: Date range filtering
- **MinReactions/MaxReactions**: Filter by reaction count range
- **IncludeDeleted**: Option to include soft-deleted posts
- **LanguageCode**: For localization support (future enhancement)

### Sorting Options

- **SortBy**: `CreatedAt` (default), `UpdatedAt`, `NumberOfReactions`
- **SortOrder**: `desc` (default), `asc`

## Usage Example

```csharp
// Inject IMediator in your controller/service
private readonly IMediator _mediator;

// Create and send query
var query = new GetBasePostsQuery
{
    Page = 1,
    PageSize = 20,
    IsActive = true,
    UserId = 123,
    PostTypeIds = new List<int> { 1, 2, 3 },
    CreatedAfter = DateTime.UtcNow.AddDays(-30),
    SortBy = "NumberOfReactions",
    SortOrder = "desc"
};

var result = await _mediator.Send(query, cancellationToken);

if (result.IsSuccess)
{
    var paginatedPosts = result.Value;
    // Use paginatedPosts.Items, paginatedPosts.TotalCount, etc.
}
```

## Response Structure

```csharp
public class PaginatedResult<BasePostDto>
{
    public List<BasePostDto> Items { get; set; }
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}
```

## Validation

The handler includes comprehensive input validation:

- Page must be ≥ 1
- PageSize must be 1-100
- UserId must be > 0 if provided
- PostTypeId must be > 0 if provided
- Date ranges must be valid
- Reaction ranges must be valid
- Sort parameters must be from allowed values

## Performance Notes

- Uses EF Core `Include()` for related data (media, localizations)
- Optimized with single count query and paginated data query
- Indexes on commonly filtered fields (UserId, PostTypeId, CreatedAt, IsActive, IsDeleted) are recommended
