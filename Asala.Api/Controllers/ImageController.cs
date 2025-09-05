using Asala.Api.Models;
using Asala.Core.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/images")]
public class ImageController : BaseController
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<ImageController> _logger;

    // Configuration constants
    private const int MaxFileSizeInMB = 10;
    private const int MaxFileSizeInBytes = MaxFileSizeInMB * 1024 * 1024;
    private readonly string[] AllowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
    };
    private readonly string[] AllowedMimeTypes =
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
    };

    public ImageController(IWebHostEnvironment webHostEnvironment, ILogger<ImageController> logger)
        : base()
    {
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }

    /// <summary>
    /// Upload an image file to the server
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="folder">Optional folder name within wwwroot (default: "uploads")</param>
    /// <returns>Upload result with file information</returns>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromForm] string folder = "uploads",
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Validate file exists
            if (file == null || file.Length == 0)
            {
                var noFileResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.IMAGE_FILE_REQUIRED
                );
                return CreateResponse(noFileResult);
            }

            // Validate file size
            if (file.Length > MaxFileSizeInBytes)
            {
                var sizeResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.IMAGE_FILE_TOO_LARGE
                );
                return CreateResponse(sizeResult);
            }

            // Validate file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(fileExtension))
            {
                var formatResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.IMAGE_INVALID_FORMAT
                );
                return CreateResponse(formatResult);
            }

            // Validate MIME type
            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                var mimeResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.IMAGE_INVALID_FORMAT
                );
                return CreateResponse(mimeResult);
            }

            // Sanitize folder name
            folder = SanitizeFolderName(folder);

            // Create upload directory if it doesn't exist
            var uploadPath = Path.Combine(_webHostEnvironment.WebRootPath, folder);
            if (!Directory.Exists(uploadPath))
            {
                try
                {
                    Directory.CreateDirectory(uploadPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to create upload directory: {UploadPath}",
                        uploadPath
                    );
                    var dirResult = Result<ImageUploadResponseDto>.Failure(
                        MessageCodes.IMAGE_DIRECTORY_CREATE_ERROR
                    );
                    return CreateResponse(dirResult);
                }
            }

            // Generate unique filename to prevent conflicts
            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var guidPart = Guid.NewGuid().ToString("N")[..8];
            var uniqueFileName =
                $"{originalFileName}_{DateTime.UtcNow:yyyyMMddHHmmss}_{guidPart}{fileExtension}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            // Save file to disk
            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save file: {FilePath}", filePath);
                var saveResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.IMAGE_UPLOAD_ERROR
                );
                return CreateResponse(saveResult);
            }

            // Create response DTO
            var response = new ImageUploadResponseDto
            {
                FileName = uniqueFileName,
                FilePath = Path.Combine(folder, uniqueFileName).Replace('\\', '/'),
                FileUrl = $"/{folder}/{uniqueFileName}".Replace('\\', '/'),
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
            };

            var successResult = Result<ImageUploadResponseDto>.Success(response);
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during image upload");
            var errorResult = Result<ImageUploadResponseDto>.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// Get information about an uploaded image
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <param name="fileName">Name of the image file</param>
    /// <returns>Image information if file exists</returns>
    [HttpGet("{folder}/{fileName}")]
    public IActionResult GetImageInfo(string folder, string fileName)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var filePath = Path.Combine(_webHostEnvironment.WebRootPath, folder, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                var notFoundResult = Result<ImageUploadResponseDto>.Failure(
                    MessageCodes.ENTITY_NOT_FOUND
                );
                return CreateResponse(notFoundResult);
            }

            var fileInfo = new FileInfo(filePath);
            var response = new ImageUploadResponseDto
            {
                FileName = fileName,
                FilePath = Path.Combine(folder, fileName).Replace('\\', '/'),
                FileUrl = $"/{folder}/{fileName}".Replace('\\', '/'),
                FileSize = fileInfo.Length,
                UploadedAt = fileInfo.CreationTimeUtc,
            };

            var successResult = Result<ImageUploadResponseDto>.Success(response);
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving image info for {Folder}/{FileName}",
                folder,
                fileName
            );
            var errorResult = Result<ImageUploadResponseDto>.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// Delete an uploaded image
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <param name="fileName">Name of the image file to delete</param>
    /// <returns>Result of the deletion operation</returns>
    [HttpDelete("{folder}/{fileName}")]
    public IActionResult DeleteImage(string folder, string fileName)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var filePath = Path.Combine(_webHostEnvironment.WebRootPath, folder, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                var notFoundResult = Result.Failure(MessageCodes.ENTITY_NOT_FOUND);
                return CreateResponse(notFoundResult);
            }

            System.IO.File.Delete(filePath);

            var successResult = Result.Success();
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {Folder}/{FileName}", folder, fileName);
            var errorResult = Result.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// List all images in a specific folder
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <returns>List of images in the specified folder</returns>
    [HttpGet("list/{folder}")]
    public IActionResult ListImages(string folder)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var folderPath = Path.Combine(_webHostEnvironment.WebRootPath, folder);

            if (!Directory.Exists(folderPath))
            {
                var notFoundResult = Result<List<ImageUploadResponseDto>>.Success(
                    new List<ImageUploadResponseDto>()
                );
                return CreateResponse(notFoundResult);
            }

            var imageFiles = Directory
                .GetFiles(folderPath)
                .Where(file =>
                    AllowedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant())
                )
                .Select(file =>
                {
                    var fileInfo = new FileInfo(file);
                    return new ImageUploadResponseDto
                    {
                        FileName = fileInfo.Name,
                        FilePath = Path.Combine(folder, fileInfo.Name).Replace('\\', '/'),
                        FileUrl = $"/{folder}/{fileInfo.Name}".Replace('\\', '/'),
                        FileSize = fileInfo.Length,
                        UploadedAt = fileInfo.CreationTimeUtc,
                    };
                })
                .OrderByDescending(img => img.UploadedAt)
                .ToList();

            var successResult = Result<List<ImageUploadResponseDto>>.Success(imageFiles);
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing images in folder {Folder}", folder);
            var errorResult = Result<List<ImageUploadResponseDto>>.Failure(
                MessageCodes.INTERNAL_ERROR
            );
            return CreateResponse(errorResult);
        }
    }

    private static string SanitizeFolderName(string folder)
    {
        // Remove any path traversal attempts and invalid characters
        folder = folder?.Trim() ?? "uploads";
        folder = folder.Replace("..", "").Replace("\\", "").Replace("/", "");

        // Use a default if the folder name becomes empty after sanitization
        if (string.IsNullOrWhiteSpace(folder))
        {
            folder = "uploads";
        }

        return folder;
    }
}
