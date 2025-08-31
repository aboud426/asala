# Category API Documentation

## Base URL
All endpoints are prefixed with `/api/categories`

## Common Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "string",
  "messageCode": "string",
  "data": {} // Present for endpoints that return data
}
```

### Error Response
```json
{
  "success": false,
  "message": "string",
  "messageCode": "string"
}
```

---

## Endpoints

### 1. Get Categories (Paginated)

**GET** `/api/categories`

Retrieves a paginated list of categories.

#### Query Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `page` | integer | 1 | No | Page number (starts from 1) |
| `pageSize` | integer | 5 | No | Number of items per page |
| `activeOnly` | boolean | null | No | Filter to show only active categories |

#### Request Example
```http
GET /api/categories?page=1&pageSize=10&activeOnly=true
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "localizedName": "إلكترونيات",
        "localizedDescription": "الأجهزة الإلكترونية والاكسسوارات",
        "parentId": null,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Mobile Phones",
        "description": "Smartphones and mobile accessories",
        "localizedName": "هواتف محمولة",
        "localizedDescription": "الهواتف الذكية واكسسوارات المحمول",
        "parentId": 1,
        "isActive": true,
        "createdAt": "2024-01-15T10:35:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 2. Get Categories Dropdown

**GET** `/api/categories/dropdown`

Retrieves a simplified list of categories for dropdown/select components.

#### Request Example
```http
GET /api/categories/dropdown
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "parentId": null
    },
    {
      "id": 2,
      "name": "Mobile Phones",
      "parentId": 1
    }
  ]
}
```

---

### 3. Create Category

**POST** `/api/categories`

Creates a new category.

#### Request Body
```json
{
  "name": "string",        // Required: Category name
  "description": "string", // Required: Category description
  "parentId": "integer",   // Optional: Parent category ID (null for root categories)
  "isActive": "boolean"    // Optional: Active status (defaults to true)
}
```

#### Request Example
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Laptops",
  "description": "Laptop computers and accessories",
  "parentId": 1,
  "isActive": true
}
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "id": 3,
    "name": "Laptops",
    "description": "Laptop computers and accessories",
    "localizedName": null,
    "localizedDescription": null,
    "parentId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 4. Update Category

**PUT** `/api/categories/{id}`

Updates an existing category.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

#### Request Body
```json
{
  "name": "string",        // Required: Category name
  "description": "string", // Required: Category description
  "parentId": "integer",   // Optional: Parent category ID (null for root categories)
  "isActive": "boolean"    // Required: Active status
}
```

#### Request Example
```http
PUT /api/categories/3
Content-Type: application/json

{
  "name": "Gaming Laptops",
  "description": "High-performance gaming laptop computers",
  "parentId": 1,
  "isActive": true
}
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "id": 3,
    "name": "Gaming Laptops",
    "description": "High-performance gaming laptop computers",
    "localizedName": null,
    "localizedDescription": null,
    "parentId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:15:00Z"
  }
}
```

---

### 5. Toggle Category Activation

**PUT** `/api/categories/{id}/toggle-activation`

Toggles the active status of a category (active ↔ inactive).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

#### Request Example
```http
PUT /api/categories/3/toggle-activation
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": ""
}
```

---

### 6. Delete Category (Soft Delete)

**DELETE** `/api/categories/{id}`

Soft deletes a category (marks as deleted without removing from database).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

#### Request Example
```http
DELETE /api/categories/3
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": ""
}
```

---

### 7. Get Subcategories

**GET** `/api/categories/{parentId}/subcategories`

Retrieves all subcategories for a given parent category.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `parentId` | integer | Yes | Parent category ID |

#### Query Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `languageCode` | string | null | No | Language code for localized content |

#### Request Example
```http
GET /api/categories/1/subcategories?languageCode=ar
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": [
    {
      "id": 2,
      "name": "Mobile Phones",
      "description": "Smartphones and mobile accessories",
      "localizedName": "هواتف محمولة",
      "localizedDescription": "الهواتف الذكية واكسسوارات المحمول",
      "parentId": 1,
      "isActive": true,
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    },
    {
      "id": 3,
      "name": "Laptops",
      "description": "Laptop computers and accessories",
      "localizedName": "لابتوب",
      "localizedDescription": "أجهزة لابتوب واكسسوارات",
      "parentId": 1,
      "isActive": true,
      "createdAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### 8. Get Category Tree

**GET** `/api/categories/tree`

Retrieves a hierarchical tree structure of categories.

#### Query Parameters
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `rootId` | integer | null | No | Root category ID (null for full tree) |
| `languageCode` | string | null | No | Language code for localized content |

#### Request Example
```http
GET /api/categories/tree?rootId=1&languageCode=en
```

#### Response Example
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "localizedName": "Electronics",
      "localizedDescription": "Electronic devices and accessories",
      "parentId": null,
      "isActive": true,
      "children": [
        {
          "id": 2,
          "name": "Mobile Phones",
          "description": "Smartphones and mobile accessories",
          "localizedName": "Mobile Phones",
          "localizedDescription": "Smartphones and mobile accessories",
          "parentId": 1,
          "isActive": true,
          "children": []
        },
        {
          "id": 3,
          "name": "Laptops",
          "description": "Laptop computers and accessories",
          "localizedName": "Laptops",
          "localizedDescription": "Laptop computers and accessories",
          "parentId": 1,
          "isActive": true,
          "children": []
        }
      ]
    }
  ]
}
```

---

## Data Models

### CategoryDto
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "localizedName": "string|null",
  "localizedDescription": "string|null",
  "parentId": "integer|null",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### CreateCategoryDto
```json
{
  "name": "string",        // Required
  "description": "string", // Required
  "parentId": "integer",   // Optional (null for root categories)
  "isActive": "boolean"    // Optional (defaults to true)
}
```

### UpdateCategoryDto
```json
{
  "name": "string",        // Required
  "description": "string", // Required
  "parentId": "integer",   // Optional (null for root categories)
  "isActive": "boolean"    // Required
}
```

### CategoryDropdownDto
```json
{
  "id": "integer",
  "name": "string",
  "parentId": "integer|null"
}
```

### CategoryTreeDto
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "localizedName": "string|null",
  "localizedDescription": "string|null",
  "parentId": "integer|null",
  "isActive": "boolean",
  "children": "CategoryTreeDto[]"
}
```

### PaginatedResult<T>
```json
{
  "items": "T[]",           // Array of items
  "totalCount": "integer",  // Total number of items
  "page": "integer",        // Current page number
  "pageSize": "integer",    // Items per page
  "totalPages": "integer",  // Total number of pages
  "hasNextPage": "boolean", // Whether there's a next page
  "hasPreviousPage": "boolean" // Whether there's a previous page
}
```

---

## HTTP Status Codes

All endpoints return HTTP 200 OK for both success and error responses. The actual success/failure status is indicated in the response body's `success` field.

## Error Handling

When an operation fails, the response will have:
- `success`: `false`
- `message`: Human-readable error message
- `messageCode`: Error code for programmatic handling
- `data`: Not present in error responses

## Authentication

> **Note**: Authentication requirements are not specified in the current controller implementation. If authentication is required, it should be added to the controller or via middleware.

## Rate Limiting

> **Note**: Rate limiting is not implemented in the current controller. Consider adding rate limiting for production use.

## Validation

All input validation is handled by the service layer. Invalid requests will return error responses with appropriate message codes.

## Localization

The API supports localization through the `languageCode` query parameter in certain endpoints. When provided, the response will include localized content in the `localizedName` and `localizedDescription` fields.

## Hierarchical Structure

Categories support a hierarchical structure where:
- Root categories have `parentId` as `null`
- Child categories reference their parent through `parentId`
- The tree endpoint provides a nested structure for easy consumption by frontend applications
- Subcategories endpoint allows fetching direct children of a specific category

## Business Rules

- Categories can have unlimited nesting levels through the parent-child relationship
- Soft delete ensures data integrity and allows for potential data recovery
- Toggle activation allows temporarily hiding categories without deletion
- Localization support enables multi-language category names and descriptions
