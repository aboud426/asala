# File Upload API Documentation

## Image Upload

### Endpoint

```
POST /api/images/upload
```

### Parameters

- `file` (required): Image file to upload
- `folder` (optional): Destination folder name (default: "uploads")

### Supported Formats

- Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- Max size: **10MB**

### Example Request (cURL)

```bash
curl -X POST "/api/images/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/image.jpg" \
  -F "folder=profile-pics"
```

### Example Request (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'profile-pics');

fetch('/api/images/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response

```json
{
  "success": true,
  "data": {
    "fileName": "image_20250920143052_a1b2c3d4.jpg",
    "filePath": "profile-pics/image_20250920143052_a1b2c3d4.jpg",
    "fileUrl": "/profile-pics/image_20250920143052_a1b2c3d4.jpg",
    "fileSize": 2048576,
    "uploadedAt": "2025-09-20T14:30:52.123Z"
  }
}
```

---

## Video Upload

### Endpoint

```
POST /api/videos/upload
```

### Parameters

- `file` (required): Video file to upload
- `folder` (optional): Destination folder name (default: "videos")

### Supported Formats

- Extensions: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.flv`, `.wmv`, `.m4v`
- Max size: **500MB**

### Example Request (cURL)

```bash
curl -X POST "/api/videos/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/video.mp4" \
  -F "folder=content"
```

### Example Request (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('folder', 'content');

fetch('/api/videos/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response

```json
{
  "success": true,
  "data": {
    "fileName": "video_20250920143052_a1b2c3d4.mp4",
    "filePath": "content/video_20250920143052_a1b2c3d4.mp4",
    "fileUrl": "/content/video_20250920143052_a1b2c3d4.mp4",
    "fileSize": 52428800,
    "uploadedAt": "2025-09-20T14:30:52.123Z",
    "duration": "00:02:30",
    "width": 1920,
    "height": 1080,
    "format": "mp4"
  }
}
```

---

## Error Responses

### Common Error Codes

- `IMAGE_FILE_REQUIRED` / `VIDEO_FILE_REQUIRED`: No file provided
- `IMAGE_FILE_TOO_LARGE` / `VIDEO_FILE_TOO_LARGE`: File exceeds size limit
- `IMAGE_INVALID_FORMAT` / `VIDEO_INVALID_FORMAT`: Unsupported file type
- `INTERNAL_ERROR`: Server error

### Error Response Format

```json
{
  "success": false,
  "errorCode": "IMAGE_FILE_TOO_LARGE",
  "message": "File size exceeds maximum limit"
}
```

---

## Notes

- Files are automatically renamed with timestamp and unique ID to prevent conflicts
- Folder names are sanitized to prevent path traversal attacks
- Upload directories are created automatically if they don't exist
- All file paths use forward slashes (`/`) for URLs
