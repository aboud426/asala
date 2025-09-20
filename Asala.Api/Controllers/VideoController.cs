using Asala.Api.Models;
using Asala.Core.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/videos")]
public class VideoController : BaseController
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<VideoController> _logger;

    // Configuration constants for video files
    private const int MaxFileSizeInMB = 100; // 100MB limit for videos (reduced from 500MB)
    private const int MaxFileSizeInBytes = MaxFileSizeInMB * 1024 * 1024;
    private readonly string[] AllowedExtensions =
    {
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        ".webm",
        ".flv",
        ".wmv",
        ".m4v",
    };
    private readonly string[] AllowedMimeTypes =
    {
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
        "video/x-flv",
        "video/x-ms-wmv",
        "video/x-m4v",
    };

    public VideoController(IWebHostEnvironment webHostEnvironment, ILogger<VideoController> logger)
        : base()
    {
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }

    /// <summary>
    /// Upload a video file to the server
    /// </summary>
    /// <param name="file">The video file to upload</param>
    /// <param name="folder">Optional folder name within wwwroot (default: "videos")</param>
    /// <returns>Upload result with file information</returns>
    [HttpPost("upload")]
    [RequestSizeLimit(110 * 1024 * 1024)] // 110MB request limit (slightly above file limit)
    [RequestFormLimits(MultipartBodyLengthLimit = 110 * 1024 * 1024)]
    public async Task<IActionResult> UploadVideo(
        IFormFile file,
        [FromForm] string folder = "videos",
        CancellationToken cancellationToken = default
    )
    {
        var startTime = DateTime.UtcNow;
        _logger.LogInformation("Video upload started. File: {FileName}, Size: {FileSize} bytes", 
            file?.FileName ?? "Unknown", file?.Length ?? 0);
            
        try
        {
            // Validate file exists
            if (file == null || file.Length == 0)
            {
                var noFileResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.VIDEO_FILE_REQUIRED
                );
                return CreateResponse(noFileResult);
            }

            // Validate file size
            if (file.Length > MaxFileSizeInBytes)
            {
                var sizeResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.VIDEO_FILE_TOO_LARGE
                );
                return CreateResponse(sizeResult);
            }

            // Validate file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(fileExtension))
            {
                var formatResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.VIDEO_INVALID_FORMAT
                );
                return CreateResponse(formatResult);
            }

            // Validate MIME type
            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                var mimeResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.VIDEO_INVALID_FORMAT
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
                    var dirResult = Result<VideoUploadResponseDto>.Failure(
                        MessageCodes.VIDEO_DIRECTORY_CREATE_ERROR
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
                _logger.LogError(ex, "Failed to save video file: {FilePath}", filePath);
                var saveResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.VIDEO_UPLOAD_ERROR
                );
                return CreateResponse(saveResult);
            }

            // Get video metadata (optional - basic implementation)
            var videoMetadata = await GetVideoMetadata(filePath);

            // Create response DTO
            var response = new VideoUploadResponseDto
            {
                FileName = uniqueFileName,
                FilePath = Path.Combine(folder, uniqueFileName).Replace('\\', '/'),
                FileUrl = $"/{folder}/{uniqueFileName}".Replace('\\', '/'),
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
                Duration = videoMetadata.Duration,
                Width = videoMetadata.Width,
                Height = videoMetadata.Height,
                Format = fileExtension.TrimStart('.'),
            };

            var uploadDuration = DateTime.UtcNow - startTime;
            _logger.LogInformation("Video upload completed successfully. File: {FileName}, Duration: {Duration}ms", 
                uniqueFileName, uploadDuration.TotalMilliseconds);

            var successResult = Result<VideoUploadResponseDto>.Success(response);
            return CreateResponse(successResult);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Video upload was cancelled. File: {FileName}", file?.FileName ?? "Unknown");
            var cancelResult = Result<VideoUploadResponseDto>.Failure(MessageCodes.OPERATION_CANCELLED);
            return CreateResponse(cancelResult);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "IO error during video upload. File: {FileName}", file?.FileName ?? "Unknown");
            var ioResult = Result<VideoUploadResponseDto>.Failure(MessageCodes.VIDEO_UPLOAD_ERROR);
            return CreateResponse(ioResult);
        }
        catch (Exception ex)
        {
            var uploadDuration = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "Unexpected error during video upload. File: {FileName}, Duration: {Duration}ms", 
                file?.FileName ?? "Unknown", uploadDuration.TotalMilliseconds);
            var errorResult = Result<VideoUploadResponseDto>.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// Get information about an uploaded video
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <param name="fileName">Name of the video file</param>
    /// <returns>Video information if file exists</returns>
    [HttpGet("{folder}/{fileName}")]
    public async Task<IActionResult> GetVideoInfo(string folder, string fileName)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var filePath = Path.Combine(_webHostEnvironment.WebRootPath, folder, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                var notFoundResult = Result<VideoUploadResponseDto>.Failure(
                    MessageCodes.ENTITY_NOT_FOUND
                );
                return CreateResponse(notFoundResult);
            }

            var fileInfo = new FileInfo(filePath);
            var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
            var videoMetadata = await GetVideoMetadata(filePath);

            var response = new VideoUploadResponseDto
            {
                FileName = fileName,
                FilePath = Path.Combine(folder, fileName).Replace('\\', '/'),
                FileUrl = $"/{folder}/{fileName}".Replace('\\', '/'),
                FileSize = fileInfo.Length,
                UploadedAt = fileInfo.CreationTimeUtc,
                Duration = videoMetadata.Duration,
                Width = videoMetadata.Width,
                Height = videoMetadata.Height,
                Format = fileExtension.TrimStart('.'),
            };

            var successResult = Result<VideoUploadResponseDto>.Success(response);
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving video info for {Folder}/{FileName}",
                folder,
                fileName
            );
            var errorResult = Result<VideoUploadResponseDto>.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// Delete an uploaded video
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <param name="fileName">Name of the video file to delete</param>
    /// <returns>Result of the deletion operation</returns>
    [HttpDelete("{folder}/{fileName}")]
    public IActionResult DeleteVideo(string folder, string fileName)
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
            _logger.LogError(ex, "Error deleting video {Folder}/{FileName}", folder, fileName);
            var errorResult = Result.Failure(MessageCodes.INTERNAL_ERROR);
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// List all videos in a specific folder
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <returns>List of videos in the specified folder</returns>
    [HttpGet("list/{folder}")]
    public async Task<IActionResult> ListVideos(string folder)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var folderPath = Path.Combine(_webHostEnvironment.WebRootPath, folder);

            if (!Directory.Exists(folderPath))
            {
                var notFoundResult = Result<List<VideoUploadResponseDto>>.Success(
                    new List<VideoUploadResponseDto>()
                );
                return CreateResponse(notFoundResult);
            }

            var videoFiles = new List<VideoUploadResponseDto>();
            var files = Directory
                .GetFiles(folderPath)
                .Where(file =>
                    AllowedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant())
                );

            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                var fileExtension = Path.GetExtension(fileInfo.Name).ToLowerInvariant();
                var videoMetadata = await GetVideoMetadata(file);

                videoFiles.Add(
                    new VideoUploadResponseDto
                    {
                        FileName = fileInfo.Name,
                        FilePath = Path.Combine(folder, fileInfo.Name).Replace('\\', '/'),
                        FileUrl = $"/{folder}/{fileInfo.Name}".Replace('\\', '/'),
                        FileSize = fileInfo.Length,
                        UploadedAt = fileInfo.CreationTimeUtc,
                        Duration = videoMetadata.Duration,
                        Width = videoMetadata.Width,
                        Height = videoMetadata.Height,
                        Format = fileExtension.TrimStart('.'),
                    }
                );
            }

            var sortedVideoFiles = videoFiles.OrderByDescending(video => video.UploadedAt).ToList();

            var successResult = Result<List<VideoUploadResponseDto>>.Success(sortedVideoFiles);
            return CreateResponse(successResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing videos in folder {Folder}", folder);
            var errorResult = Result<List<VideoUploadResponseDto>>.Failure(
                MessageCodes.INTERNAL_ERROR
            );
            return CreateResponse(errorResult);
        }
    }

    /// <summary>
    /// Stream a video file for playback
    /// </summary>
    /// <param name="folder">Folder name within wwwroot</param>
    /// <param name="fileName">Name of the video file</param>
    /// <returns>Video file stream</returns>
    [HttpGet("stream/{folder}/{fileName}")]
    public IActionResult StreamVideo(string folder, string fileName)
    {
        try
        {
            folder = SanitizeFolderName(folder);
            var filePath = Path.Combine(_webHostEnvironment.WebRootPath, folder, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = GetMimeTypeForExtension(fileExtension);

            var fileStream = new FileStream(
                filePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read
            );
            return new FileStreamResult(fileStream, contentType)
            {
                EnableRangeProcessing = true, // Enables range requests for video streaming
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming video {Folder}/{FileName}", folder, fileName);
            return StatusCode(500, "Internal server error");
        }
    }

    private static string SanitizeFolderName(string folder)
    {
        // Remove any path traversal attempts and invalid characters
        folder = folder?.Trim() ?? "videos";
        folder = folder.Replace("..", "").Replace("\\", "").Replace("/", "");

        // Use a default if the folder name becomes empty after sanitization
        if (string.IsNullOrWhiteSpace(folder))
        {
            folder = "videos";
        }

        return folder;
    }

    private static string GetMimeTypeForExtension(string extension)
    {
        return extension switch
        {
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".avi" => "video/x-msvideo",
            ".mkv" => "video/x-matroska",
            ".webm" => "video/webm",
            ".flv" => "video/x-flv",
            ".wmv" => "video/x-ms-wmv",
            ".m4v" => "video/x-m4v",
            _ => "application/octet-stream",
        };
    }

    /// <summary>
    /// Basic video metadata extraction (placeholder implementation)
    /// In a real application, you might use FFMpeg or similar libraries
    /// </summary>
    private static Task<(string Duration, int Width, int Height)> GetVideoMetadata(
        string filePath
    )
    {
        // This is a basic placeholder implementation
        // In a production environment, you would use FFMpeg or similar libraries
        // to extract actual video metadata
        
        // Return immediately to avoid any delays during upload
        return Task.FromResult(("00:00:00", 0, 0)); // Default values
    }
}
