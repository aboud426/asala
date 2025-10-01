# Get Complete Post By ID API (Generic & Localized)

This API retrieves complete post information by ID with localization support. It returns all post data from the BasePost table plus type-specific data from Reel, Article, or NormalPost tables based on the post type.

## Endpoint

```
GET /api/posts/{id}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | long | Yes | - | Post ID to retrieve |
| `languageCode` | string | No | "en" | Language code for localized content |
| `includeInactive` | bool | No | false | Include inactive posts in search |

## Examples

### Get complete post by ID with default language (English)
```
GET /api/posts/123
```

### Get complete post by ID with Arabic localization
```
GET /api/posts/123?languageCode=ar
```

### Get complete post by ID including inactive posts
```
GET /api/posts/123?includeInactive=true
```

## Response Format

### Success Response (Reel Post)
```json
{
  "isSuccess": true,
  "messageCode": "SUCCESS",
  "value": {
    "id": 123,
    "userId": 456,
    "userName": "John Doe",
    "description": "This is the localized post description",
    "numberOfReactions": 25,
    "numberOfComments": 8,
    "postTypeId": 1,
    "postTypeName": "Reel",
    "isActive": true,
    "createdAt": "2023-10-01T12:30:00Z",
    "updatedAt": "2023-10-01T12:35:00Z",
    "postMedias": [
      {
        "id": 789,
        "url": "https://example.com/media/video1.mp4",
        "mediaType": 2,
        "displayOrder": 0
      }
    ],
    "localizations": [
      {
        "id": 101,
        "languageId": 1,
        "description": "English description",
        "languageName": "English",
        "languageCode": "en"
      },
      {
        "id": 102,
        "languageId": 2,
        "description": "الوصف باللغة العربية",
        "languageName": "Arabic",
        "languageCode": "ar"
      }
    ],
    "reel": {
      "postId": 123,
      "expirationDate": "2023-10-08T12:30:00Z"
    },
    "article": null,
    "normalPost": null
  }
}
```

### Success Response (Article Post)
```json
{
  "isSuccess": true,
  "messageCode": "SUCCESS",
  "value": {
    "id": 124,
    "userId": 456,
    "userName": "Jane Smith",
    "description": "This is an article post description",
    "numberOfReactions": 50,
    "numberOfComments": 15,
    "postTypeId": 2,
    "postTypeName": "Article",
    "isActive": true,
    "createdAt": "2023-10-01T14:00:00Z",
    "updatedAt": "2023-10-01T14:05:00Z",
    "postMedias": [
      {
        "id": 790,
        "url": "https://example.com/media/article-image.jpg",
        "mediaType": 1,
        "displayOrder": 0
      }
    ],
    "localizations": [...],
    "reel": null,
    "article": {
      "postId": 124
    },
    "normalPost": null
  }
}
```

### Success Response (Normal Post)
```json
{
  "isSuccess": true,
  "messageCode": "SUCCESS",
  "value": {
    "id": 125,
    "userId": 789,
    "userName": "Mike Johnson",
    "description": "This is a normal post",
    "numberOfReactions": 10,
    "numberOfComments": 3,
    "postTypeId": 3,
    "postTypeName": "Normal",
    "isActive": true,
    "createdAt": "2023-10-01T16:00:00Z",
    "updatedAt": "2023-10-01T16:00:00Z",
    "postMedias": [...],
    "localizations": [...],
    "reel": null,
    "article": null,
    "normalPost": {
      "postId": 125
    }
  }
}
```

### Error Response (Post Not Found)
```json
{
  "isSuccess": false,
  "messageCode": "POST_NOT_FOUND",
  "value": null
}
```

### Error Response (Invalid ID)
```json
{
  "isSuccess": false,
  "messageCode": "INVALID_INPUT",
  "value": null
}
```

### Error Response (Language Not Found)
```json
{
  "isSuccess": false,
  "messageCode": "LANGUAGE_NOT_FOUND",
  "value": null
}
```

## Field Descriptions

### **Post Fields**
- `id`: Unique post identifier
- `userId`: ID of the user who created the post
- `description`: Post description (localized based on languageCode parameter)
- `numberOfReactions`: Count of reactions (likes, etc.)
- `numberOfComments`: Count of comments
- `postTypeId`: Numeric ID of the post type
- `isActive`: Whether the post is active
- `createdAt`: When the post was created
- `updatedAt`: When the post was last updated

### **Media Fields (postMedias array)**
- `id`: Media item ID
- `url`: URL to the media file
- `mediaType`: Type of media (1=Image, 2=Video, 3=Audio, 4=Document, 5=Other)
- `displayOrder`: Order for displaying media items

### **Localization Fields (localizations array)**
- `id`: Localization record ID
- `languageId`: ID of the language
- `description`: Localized description in this language
- `languageName`: Human-readable language name
- `languageCode`: Language code (e.g., "en", "ar")

## Localization Behavior

1. **Primary Description**: The main `description` field returns the localized version based on the `languageCode` parameter
2. **Fallback**: If no localization exists for the specified language, it falls back to the original post description
3. **All Localizations**: The `localizations` array contains all available translations for the post
4. **Language Validation**: The API validates that the requested language exists and is active

## Legacy Endpoint

For backward compatibility, the original endpoint is still available at:
```
GET /api/posts/legacy/{id}
```

This endpoint uses the original PostService implementation without localization support.
