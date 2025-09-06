# Product Category API Documentation

## Base URL

All endpoints are prefixed with `/api/product-categories`

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

### 1. Get Product Categories (Paginated)

**GET** `/api/product-categories`

Retrieves a paginated list of product categories.

#### Query Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `page` | integer | 1 | No | Page number (starts from 1) |
| `pageSize` | integer | 5 | No | Number of items per page |
| `activeOnly` | boolean | null | No | Filter to show only active product categories |

#### Request Example

```http
GET /api/product-categories?page=1&pageSize=10&activeOnly=true
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
        "name": "Smartphones",
        "description": "Mobile phones and smartphone accessories",
        "parentId": null,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "iPhone",
        "description": "Apple iPhone products and accessories",
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

### 2. Get Product Categories Dropdown

**GET** `/api/product-categories/dropdown`

Retrieves a simplified list of product categories for dropdown/select components.

#### Request Example

```http
GET /api/product-categories/dropdown
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
      "name": "Smartphones",
      "parentId": null
    },
    {
      "id": 2,
      "name": "iPhone",
      "parentId": 1
    }
  ]
}
```

---

### 3. Create Product Category

**POST** `/api/product-categories`

Creates a new product category.

#### Request Body

```json
{
  "name": "string",        // Required: Product category name
  "description": "string", // Required: Product category description
  "parentId": "integer",   // Optional: Parent category ID (null for root categories)
  "isActive": "boolean"    // Optional: Active status (defaults to true)
}
```

#### Request Example

```http
POST /api/product-categories
Content-Type: application/json

{
  "name": "Samsung Galaxy",
  "description": "Samsung Galaxy smartphone series",
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
    "name": "Samsung Galaxy",
    "description": "Samsung Galaxy smartphone series",
    "parentId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 4. Update Product Category

**PUT** `/api/product-categories/{id}`

Updates an existing product category.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product category ID |

#### Request Body

```json
{
  "name": "string",        // Required: Product category name
  "description": "string", // Required: Product category description
  "parentId": "integer",   // Optional: Parent category ID (null for root categories)
  "isActive": "boolean"    // Required: Active status
}
```

#### Request Example

```http
PUT /api/product-categories/3
Content-Type: application/json

{
  "name": "Samsung Galaxy S Series",
  "description": "Samsung Galaxy S series smartphones",
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
    "name": "Samsung Galaxy S Series",
    "description": "Samsung Galaxy S series smartphones",
    "parentId": 1,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:15:00Z"
  }
}
```

---

### 5. Toggle Product Category Activation

**PUT** `/api/product-categories/{id}/toggle-activation`

Toggles the active status of a product category (active ↔ inactive).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product category ID |

#### Request Example

```http
PUT /api/product-categories/3/toggle-activation
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

### 6. Delete Product Category (Soft Delete)

**DELETE** `/api/product-categories/{id}`

Soft deletes a product category (marks as deleted without removing from database).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product category ID |

#### Request Example

```http
DELETE /api/product-categories/3
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

## Data Models

### ProductCategoryDto

```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "parentId": "integer|null",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### CreateProductCategoryDto

```json
{
  "name": "string",        // Required
  "description": "string", // Required
  "parentId": "integer",   // Optional (null for root categories)
  "isActive": "boolean"    // Optional (defaults to true)
}
```

### UpdateProductCategoryDto

```json
{
  "name": "string",        // Required
  "description": "string", // Required
  "parentId": "integer",   // Optional (null for root categories)
  "isActive": "boolean"    // Required
}
```

### ProductCategoryDropdownDto

```json
{
  "id": "integer",
  "name": "string",
  "parentId": "integer|null"
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

## Hierarchical Structure

Product categories support a hierarchical structure where:

- Root categories have `parentId` as `null`
- Child categories reference their parent through `parentId`
- The dropdown endpoint provides a flat list suitable for parent category selection
- Soft delete ensures data integrity and allows for potential data recovery
- Toggle activation allows temporarily hiding categories without deletion

## Business Rules

- Product categories can have unlimited nesting levels through the parent-child relationship
- Soft delete ensures data integrity and allows for potential data recovery
- Toggle activation allows temporarily hiding categories without deletion
- Product categories are designed specifically for organizing products in e-commerce or catalog systems
