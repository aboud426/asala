# Likes API

This module provides functionality for adding and removing likes on base posts with automatic reaction count tracking.

## Features

- Add likes to base posts
- Remove likes from base posts (dislike)
- Prevent duplicate likes (one like per user per post)
- Automatic reaction count tracking on base posts
- Smart behavior for edge cases
- Soft delete for like removal (preserves audit trail)

## API Endpoints

### 1. Add Like

**POST** `/api/likes`

Adds a like to a base post and automatically increments the post's reaction count. If the user has already liked the post, returns the existing like without creating a duplicate.

#### Request Body

```json
{
  "userId": 123,
  "basePostId": 456
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 789,
    "userId": 123,
    "userName": "John Doe",
    "basePostId": 456,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Remove Like (Dislike)

**DELETE** `/api/likes`

Removes a like from a base post and automatically decrements the post's reaction count. Uses soft delete to preserve audit trail.

#### Request Body

```json
{
  "userId": 123,
  "basePostId": 456
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "wasRemoved": true,
    "message": "Like removed successfully"
  }
}
```

#### Response (No Like Found)

```json
{
  "success": true,
  "data": {
    "wasRemoved": false,
    "message": "Like not found - user hasn't liked this post"
  }
}
```

## Usage Examples

### Toggle Like Functionality

```bash
# Add a like
POST /api/likes
{
  "userId": 123,
  "basePostId": 456
}

# Remove the like (dislike)
DELETE /api/likes
{
  "userId": 123,
  "basePostId": 456
}
```

## Validation Rules

### Add Like
- **UserId**: Must exist and be active
- **BasePostId**: Must exist and be active
- **Duplicate Prevention**: One like per user per post (enforced by unique index)

### Remove Like
- **UserId**: Must exist and be active
- **BasePostId**: Must exist and be active
- **Like Existence**: Returns graceful response if like doesn't exist

## Side Effects

### Add Like
- Automatically increments `NumberOfReactions` on the target base post
- Updates base post's `UpdatedAt` timestamp
- If user already liked the post, no changes are made to reaction count

### Remove Like
- Automatically decrements `NumberOfReactions` on the target base post (minimum 0)
- Updates base post's `UpdatedAt` timestamp
- Soft deletes the like record (sets `IsDeleted = true`, `DeletedAt = now`)
- If like doesn't exist, no changes are made to reaction count

## Smart Behaviors

### Add Like
- **Idempotent**: Calling multiple times returns the same result
- **No Duplicates**: Database constraint prevents duplicate likes
- **Existing Like**: Returns existing like if user already liked the post

### Remove Like
- **Graceful**: Returns success even if like doesn't exist
- **Safe Decrement**: Never decrements reaction count below 0
- **Informative**: Response indicates whether a like was actually removed

## Database Schema

### Likes Table
- **Id**: Primary key (long)
- **BasePostId**: Foreign key to BasePost (required)
- **UserId**: Foreign key to User (required)
- **IsActive**: Soft delete flag
- **IsDeleted**: Soft delete flag
- **CreatedAt**: When the like was created
- **UpdatedAt**: When the like was last updated
- **DeletedAt**: When the like was soft deleted (nullable)

### Indexes
- Primary key on `Id`
- Index on `BasePostId` for efficient post queries
- Index on `UserId` for efficient user queries
- Index on `CreatedAt` for chronological sorting
- **Unique composite index** on `(BasePostId, UserId)` to prevent duplicate likes

## Integration Examples

### Frontend Toggle Button
```javascript
async function toggleLike(userId, basePostId, isCurrentlyLiked) {
  if (isCurrentlyLiked) {
    // Remove like
    const response = await fetch('/api/likes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, basePostId })
    });
    const result = await response.json();
    return { liked: false, wasChanged: result.data.wasRemoved };
  } else {
    // Add like
    const response = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, basePostId })
    });
    const result = await response.json();
    return { liked: true, wasChanged: true };
  }
}
```

### Backend Usage
```csharp
// Add a like
var addCommand = new AddLikeCommand
{
    UserId = 123,
    BasePostId = 456
};
var addResult = await _mediator.Send(addCommand, cancellationToken);

// Remove a like
var removeCommand = new RemoveLikeCommand
{
    UserId = 123,
    BasePostId = 456
};
var removeResult = await _mediator.Send(removeCommand, cancellationToken);

if (removeResult.IsSuccess && removeResult.Value.WasRemoved)
{
    Console.WriteLine("Like was successfully removed");
}
```

## Error Handling

- **USER_NOT_FOUND**: User doesn't exist or is inactive
- **NOT_FOUND**: Base post doesn't exist or is inactive
- **INTERNAL_SERVER_ERROR**: Unexpected server error

## Performance Considerations

- **Efficient Queries**: All operations use indexed columns
- **Minimal Database Hits**: Single query for validation, single update for reaction count
- **Soft Delete**: Preserves data integrity while allowing "unlike" functionality
- **Atomic Operations**: Each operation is atomic and consistent

## Complete Like System

The Likes API now provides a complete like/unlike system:

1. **✅ Add Like** - `POST /api/likes`
2. **✅ Remove Like** - `DELETE /api/likes`
3. **✅ Duplicate Prevention** - Unique constraints prevent duplicate likes
4. **✅ Auto-counting** - BasePost.NumberOfReactions automatically maintained
5. **✅ Audit Trail** - Soft delete preserves like history
6. **✅ Smart Behavior** - Graceful handling of edge cases
7. **✅ Performance** - Efficient database operations with proper indexing
