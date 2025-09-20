# Reel API Documentation

This API provides endpoints for managing reels in the system.

## Endpoints

### GET /api/reels

Get paginated list of reels with full data.

#### Description

Retrieves a paginated list of reels, each containing complete BasePost data including media, localizations, and metadata. Supports comprehensive filtering, sorting, and pagination options.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (minimum: 1) |
| `pageSize` | integer | No | 10 | Number of items per page (1-100) |
| `activeOnly` | boolean? | No | null | Filter by active status (null=all, true=active, false=inactive) |
| `userId` | integer? | No | null | Filter by specific user ID |
| `description` | string? | No | null | Filter by description text (contains search) |
| `createdAfter` | datetime? | No | null | Filter reels created after this date |
| `createdBefore` | datetime? | No | null | Filter reels created before this date |
| `minReactions` | integer? | No | null | Minimum number of reactions |
| `maxReactions` | integer? | No | null | Maximum number of reactions |
| `sortBy` | string? | No | "CreatedAt" | Sort field: "CreatedAt", "UpdatedAt", "NumberOfReactions" |
| `sortOrder` | string? | No | "desc" | Sort order: "asc", "desc" |

#### Request Example

```http
GET /api/reels?page=1&pageSize=20&activeOnly=true&sortBy=NumberOfReactions&sortOrder=desc
```

#### Response Schema

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "postId": 123,
        "basePost": {
          "id": 123,
          "userId": 456,
          "description": "Amazing reel content!",
          "numberOfReactions": 150,
          "postTypeId": 2,
          "isActive": true,
          "createdAt": "2025-01-15T10:30:00Z",
          "updatedAt": "2025-01-15T10:30:00Z",
          "postMedias": [
            {
              "id": 789,
              "url": "https://example.com/video.mp4",
              "mediaType": "Video"
            }
          ],
          "localizations": [
            {
              "id": 101,
              "languageId": 1,
              "description": "Contenido increíble del reel!",
              "languageName": "Spanish",
              "languageCode": "es"
            }
          ]
        }
      }
    ],
    "totalCount": 500,
    "page": 1,
    "pageSize": 20,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "message": null,
  "messageCode": null
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "data": null,
  "message": "Invalid input parameters",
  "messageCode": "INVALID_INPUT"
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "data": null,
  "message": "An internal error occurred",
  "messageCode": "INTERNAL_SERVER_ERROR"
}
```

#### Usage Examples

1. **Get first page of active reels**

   ```
   GET /api/reels?activeOnly=true
   ```

2. **Search reels by description**

   ```
   GET /api/reels?description=tutorial&page=1&pageSize=10
   ```

3. **Get most liked reels**

   ```
   GET /api/reels?sortBy=NumberOfReactions&sortOrder=desc&pageSize=50
   ```

4. **Get user's reels from last week**

   ```
   GET /api/reels?userId=123&createdAfter=2025-01-08T00:00:00Z
   ```

5. **Get reels with high engagement**

   ```
   GET /api/reels?minReactions=100&sortBy=NumberOfReactions&sortOrder=desc
   ```
