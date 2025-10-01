# Get Posts Paginated API

This API provides paginated access to posts with filtering capabilities.

## Endpoint

```
GET /api/posts/paginated
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | 1 | Page number (starts from 1) |
| `pageSize` | int | No | 10 | Number of items per page (max 100) |
| `type` | string | No | null | Post type filter: "reel", "normal", "article", or null for all types |
| `postTypeId` | int | No | null | Specific post type ID for filtering |
| `languageCode` | string | No | "en" | Language code for localized content |
| `activeOnly` | bool | No | true | Filter by active posts only |

## Examples

### Get all posts (first page)
```
GET /api/posts/paginated
```

### Get reels only
```
GET /api/posts/paginated?type=reel
```

### Get articles with specific language
```
GET /api/posts/paginated?type=article&languageCode=ar
```

### Get posts by specific post type ID
```
GET /api/posts/paginated?postTypeId=1&page=2&pageSize=20
```

### Get inactive posts
```
GET /api/posts/paginated?activeOnly=false
```

## Response Format

```json
{
  "isSuccess": true,
  "messageCode": "SUCCESS",
  "value": {
    "items": [
      {
        "id": 1,
        "userId": 123,
        "description": "Post description or localized description",
        "numberOfReactions": 10,
        "numberOfComments": 5,
        "postTypeId": 1,
        "isActive": true,
        "createdAt": "2023-10-01T12:00:00Z",
        "updatedAt": "2023-10-01T12:00:00Z",
        "postMedias": [
          {
            "id": 1,
            "url": "https://example.com/image.jpg",
            "mediaType": 1,
            "displayOrder": 0
          }
        ],
        "localizations": [
          {
            "id": 1,
            "languageId": 1,
            "description": "Localized description",
            "languageName": "English",
            "languageCode": "en"
          }
        ]
      }
    ],
    "totalCount": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Post Types

The API supports filtering by post type using the `type` parameter:

- **"reel"**: Returns posts that have a Reel entity associated
- **"normal"**: Returns posts that have a NormalPost entity associated  
- **"article"**: Returns posts that have an Article entity associated
- **null**: Returns all post types

## Localization

The API returns localized descriptions based on the `languageCode` parameter. If no localization exists for the specified language, it falls back to the original post description.

## Pagination

The response includes pagination metadata:
- `totalCount`: Total number of posts matching the filters
- `page`: Current page number
- `pageSize`: Number of items per page
- `totalPages`: Total number of pages
- `hasNextPage`: Whether there are more pages
- `hasPreviousPage`: Whether there are previous pages
