# Image Upload API Documentation

## Overview
The Image Upload API provides endpoints for uploading, retrieving, listing, and deleting image files. All images are stored in the `wwwroot` folder structure for easy access.

## Base URL
All endpoints are prefixed with `/api/images`

## Endpoints

### 1. Upload Image
Upload a single image file to the server.

**Endpoint:** `POST /api/images/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): The image file to upload
- `folder` (optional): Target folder within wwwroot (default: "uploads")

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

**File Size Limit:** 10 MB

**Example Request:**
```bash
curl -X POST "https://yourapi.com/api/images/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=products"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "IMAGE_UPLOADED_SUCCESSFULLY",
  "messageCode": "IMAGE_UPLOADED_SUCCESSFULLY",
  "data": {
    "fileName": "product_image_20240830143022_a1b2c3d4.jpg",
    "filePath": "products/product_image_20240830143022_a1b2c3d4.jpg",
    "fileUrl": "/products/product_image_20240830143022_a1b2c3d4.jpg",
    "fileSize": 256789,
    "uploadedAt": "2024-08-30T14:30:22.123Z"
  }
}
```

**Error Responses:**
- `IMAGE_FILE_REQUIRED`: No file provided
- `IMAGE_FILE_TOO_LARGE`: File exceeds 10MB limit  
- `IMAGE_INVALID_FORMAT`: Unsupported file type or MIME type
- `IMAGE_UPLOAD_ERROR`: Failed to save file to disk
- `IMAGE_DIRECTORY_CREATE_ERROR`: Failed to create upload directory

### 2. Get Image Information
Retrieve information about a specific uploaded image.

**Endpoint:** `GET /api/images/{folder}/{fileName}`

**Example Request:**
```bash
curl "https://yourapi.com/api/images/products/product_image_20240830143022_a1b2c3d4.jpg"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": {
    "fileName": "product_image_20240830143022_a1b2c3d4.jpg",
    "filePath": "products/product_image_20240830143022_a1b2c3d4.jpg",
    "fileUrl": "/products/product_image_20240830143022_a1b2c3d4.jpg",
    "fileSize": 256789,
    "uploadedAt": "2024-08-30T14:30:22.123Z"
  }
}
```

### 3. List Images in Folder
Get a list of all images in a specific folder.

**Endpoint:** `GET /api/images/list/{folder}`

**Example Request:**
```bash
curl "https://yourapi.com/api/images/list/products"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "",
  "messageCode": "",
  "data": [
    {
      "fileName": "product_image_20240830143022_a1b2c3d4.jpg",
      "filePath": "products/product_image_20240830143022_a1b2c3d4.jpg",
      "fileUrl": "/products/product_image_20240830143022_a1b2c3d4.jpg",
      "fileSize": 256789,
      "uploadedAt": "2024-08-30T14:30:22.123Z"
    }
  ]
}
```

### 4. Delete Image
Delete a specific uploaded image.

**Endpoint:** `DELETE /api/images/{folder}/{fileName}`

**Example Request:**
```bash
curl -X DELETE "https://yourapi.com/api/images/products/product_image_20240830143022_a1b2c3d4.jpg"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "",
  "messageCode": ""
}
```

## File Naming Convention
Uploaded files are automatically renamed to prevent conflicts and organize files:

**Format:** `{originalName}_{timestamp}_{uniqueId}{extension}`

**Example:** `product_image_20240830143022_a1b2c3d4.jpg`

Where:
- `product_image`: Original filename (without extension)
- `20240830143022`: UTC timestamp (yyyyMMddHHmmss)
- `a1b2c3d4`: 8-character unique identifier
- `.jpg`: Original file extension

## Security Features
- **File Type Validation**: Only approved image formats are allowed
- **MIME Type Validation**: Content-Type headers are verified
- **Size Limits**: 10MB maximum file size
- **Path Traversal Protection**: Folder names are sanitized
- **Unique Naming**: Prevents file conflicts and overwrites

## Storage Structure
Images are stored in the following structure within `wwwroot`:

```
wwwroot/
├── uploads/           # Default folder
├── products/          # Product images
├── categories/        # Category images
└── {custom_folder}/   # Any custom folder specified
```

## Error Handling
All endpoints follow the standard API response format with appropriate HTTP status codes and error messages. Error codes are localized and can be mapped to user-friendly messages.

## Usage Examples

### JavaScript/Fetch API
```javascript
async function uploadImage(file, folder = 'uploads') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    return result;
}
```

### HTML Form
```html
<form action="/api/images/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file" accept="image/*" required>
    <input type="text" name="folder" value="uploads" placeholder="Folder name">
    <button type="submit">Upload Image</button>
</form>
```

## Notes
- Images are accessible via direct URL: `https://yourapi.com/{folder}/{fileName}`
- Static file serving must be enabled (already configured in Program.cs)
- Consider implementing authentication/authorization for production use
- Monitor disk space as images accumulate over time
