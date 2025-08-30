using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

/// <summary>
/// Service for seeding message and language data programmatically
/// </summary>
public class MessageSeedService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MessageSeedService> _logger;

    public MessageSeedService(IUnitOfWork unitOfWork, ILogger<MessageSeedService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Seeds all required data (languages, messages, and localizations)
    /// </summary>
    public async Task<Result> SeedAllDataAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting data seeding process...");

            // Step 1: Seed languages
            var languageResult = await SeedLanguagesAsync(cancellationToken);
            if (languageResult.IsFailure)
            {
                _logger.LogError("Failed to seed languages: {Error}", languageResult.Error?.Code);
                return languageResult;
            }

            // Step 2: Seed messages
            var messageResult = await SeedMessagesAsync(cancellationToken);
            if (messageResult.IsFailure)
            {
                _logger.LogError("Failed to seed messages: {Error}", messageResult.Error?.Code);
                return messageResult;
            }

            // Step 3: Seed message localizations
            var localizationResult = await SeedMessageLocalizationsAsync(cancellationToken);
            if (localizationResult.IsFailure)
            {
                _logger.LogError("Failed to seed message localizations: {Error}", localizationResult.Error?.Code);
                return localizationResult;
            }

            _logger.LogInformation("Data seeding completed successfully");
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during data seeding");
            return Result.Failure($"Seeding error: {ex.Message}");
        }
    }

    private async Task<Result> SeedLanguagesAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Check if languages already exist
            var existingLanguages = await _unitOfWork.Languages.GetAllAsync(cancellationToken);
            if (existingLanguages.IsSuccess && existingLanguages.Value.Any())
            {
                _logger.LogInformation("Languages already exist, skipping language seeding");
                return Result.Success();
            }

            var languages = new List<Language>
            {
                new() { Name = "English", Code = "en", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new() { Name = "Español", Code = "es", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new() { Name = "Français", Code = "fr", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new() { Name = "العربية", Code = "ar", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            foreach (var language in languages)
            {
                var result = await _unitOfWork.Languages.AddAsync(language, cancellationToken);
                if (result.IsFailure)
                {
                    return Result.Failure($"Failed to add language {language.Code}: {result.Error?.Code}");
                }
            }

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
            {
                return Result.Failure($"Failed to save languages: {saveResult.Error?.Code}");
            }

            _logger.LogInformation("Successfully seeded {Count} languages", languages.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error seeding languages: {ex.Message}");
        }
    }

    private async Task<Result> SeedMessagesAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Check if ALL required messages already exist
            var existingMessages = await _unitOfWork.Repository<Message>().GetAllAsync(cancellationToken);
            if (existingMessages.IsSuccess && existingMessages.Value.Any())
            {
                var existingCodes = existingMessages.Value.Select(m => m.Code).ToHashSet();
                var requiredCodes = new HashSet<string>
                {
                    ErrorCodes.VALIDATION_REQUIRED_FIELD,
                    ErrorCodes.VALIDATION_INVALID_FORMAT,
                    ErrorCodes.VALIDATION_OUT_OF_RANGE,
                    ErrorCodes.VALIDATION_INVALID_LENGTH,
                    ErrorCodes.ENTITY_NOT_FOUND,
                    ErrorCodes.USER_NOT_FOUND,
                    ErrorCodes.PRODUCT_NOT_FOUND,
                    ErrorCodes.CATEGORY_NOT_FOUND,
                    ErrorCodes.PROVIDER_NOT_FOUND,
                    ErrorCodes.ORDER_NOT_FOUND,
                    ErrorCodes.LOCATION_NOT_FOUND,
                    ErrorCodes.BUSINESS_INSUFFICIENT_QUANTITY,
                    ErrorCodes.BUSINESS_PRODUCT_OUT_OF_STOCK,
                    ErrorCodes.BUSINESS_INVALID_OPERATION,
                    ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION,
                    ErrorCodes.BUSINESS_DUPLICATE_ENTRY,
                    ErrorCodes.USER_INVALID_ID,
                    ErrorCodes.USER_EMAIL_REQUIRED,
                    ErrorCodes.USER_PASSWORD_REQUIRED,
                    ErrorCodes.USER_EMAIL_EXISTS,
                    ErrorCodes.USER_INVALID_EMAIL_FORMAT,
                    ErrorCodes.USER_HAS_DEPENDENCIES,
                    ErrorCodes.PRODUCT_INVALID_ID,
                    ErrorCodes.PRODUCT_NAME_REQUIRED,
                    ErrorCodes.PRODUCT_INVALID_CATEGORY,
                    ErrorCodes.PRODUCT_INVALID_PROVIDER,
                    ErrorCodes.PRODUCT_INVALID_PRICE,
                    ErrorCodes.PRODUCT_INVALID_QUANTITY,
                    ErrorCodes.ORDER_INVALID_ID,
                    ErrorCodes.ORDER_EMPTY_CART,
                    ErrorCodes.ORDER_INVALID_ADDRESS,
                    ErrorCodes.ORDER_PAYMENT_FAILED,
                    ErrorCodes.AUTH_UNAUTHORIZED,
                    ErrorCodes.AUTH_FORBIDDEN,
                    ErrorCodes.AUTH_INVALID_TOKEN,
                    ErrorCodes.AUTH_TOKEN_EXPIRED,
                    ErrorCodes.SYSTEM_DATABASE_ERROR,
                    ErrorCodes.SYSTEM_EXTERNAL_SERVICE_ERROR,
                    ErrorCodes.SYSTEM_TIMEOUT,
                    ErrorCodes.SYSTEM_UNKNOWN_ERROR,
                    ErrorCodes.PAGINATION_INVALID_PAGE,
                    ErrorCodes.PAGINATION_INVALID_PAGE_SIZE,
                    ErrorCodes.LOCATION_INVALID_ID,
                    ErrorCodes.LOCATION_COORDINATES_INVALID,
                    ErrorCodes.MESSAGE_INVALID_ID,
                    ErrorCodes.MESSAGE_CODE_REQUIRED,
                    ErrorCodes.MESSAGE_CODE_EXISTS,
                    ErrorCodes.MESSAGE_NOT_FOUND,
                    ErrorCodes.MESSAGE_INVALID_LANGUAGE,
                    ErrorCodes.MESSAGE_TEXT_REQUIRED,
                    ErrorCodes.LANGUAGE_INVALID_ID,
                    ErrorCodes.LANGUAGE_NAME_REQUIRED,
                    ErrorCodes.LANGUAGE_CODE_REQUIRED,
                    ErrorCodes.LANGUAGE_CODE_EXISTS,
                    ErrorCodes.LANGUAGE_NOT_FOUND,
                    ErrorCodes.LANGUAGE_NAME_EXISTS,
                    ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT
                };

                // Check if all required codes exist
                if (requiredCodes.All(code => existingCodes.Contains(code)))
                {
                    _logger.LogInformation("All required messages already exist, skipping message seeding");
                    return Result.Success();
                }

                _logger.LogInformation("Some messages are missing, will seed missing ones");
            }

            var messages = new List<Message>();
            var messageId = 1;

            // Get existing message codes to avoid duplicates
            var currentExistingCodes = existingMessages.IsSuccess && existingMessages.Value.Any() 
                ? existingMessages.Value.Select(m => m.Code).ToHashSet() 
                : new HashSet<string>();

            // General validation errors
            if (!currentExistingCodes.Contains(ErrorCodes.VALIDATION_REQUIRED_FIELD))
                messages.Add(new() { Code = ErrorCodes.VALIDATION_REQUIRED_FIELD, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.VALIDATION_INVALID_FORMAT))
                messages.Add(new() { Code = ErrorCodes.VALIDATION_INVALID_FORMAT, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.VALIDATION_OUT_OF_RANGE))
                messages.Add(new() { Code = ErrorCodes.VALIDATION_OUT_OF_RANGE, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.VALIDATION_INVALID_LENGTH))
                messages.Add(new() { Code = ErrorCodes.VALIDATION_INVALID_LENGTH, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Entity not found errors
            if (!currentExistingCodes.Contains(ErrorCodes.ENTITY_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.ENTITY_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.USER_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.CATEGORY_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.CATEGORY_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PROVIDER_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.PROVIDER_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.ORDER_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.ORDER_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LOCATION_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.LOCATION_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Business logic errors
            if (!currentExistingCodes.Contains(ErrorCodes.BUSINESS_INSUFFICIENT_QUANTITY))
                messages.Add(new() { Code = ErrorCodes.BUSINESS_INSUFFICIENT_QUANTITY, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.BUSINESS_PRODUCT_OUT_OF_STOCK))
                messages.Add(new() { Code = ErrorCodes.BUSINESS_PRODUCT_OUT_OF_STOCK, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.BUSINESS_INVALID_OPERATION))
                messages.Add(new() { Code = ErrorCodes.BUSINESS_INVALID_OPERATION, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION))
                messages.Add(new() { Code = ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.BUSINESS_DUPLICATE_ENTRY))
                messages.Add(new() { Code = ErrorCodes.BUSINESS_DUPLICATE_ENTRY, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // User-specific errors
            if (!currentExistingCodes.Contains(ErrorCodes.USER_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.USER_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_EMAIL_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.USER_EMAIL_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_PASSWORD_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.USER_PASSWORD_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_EMAIL_EXISTS))
                messages.Add(new() { Code = ErrorCodes.USER_EMAIL_EXISTS, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_INVALID_EMAIL_FORMAT))
                messages.Add(new() { Code = ErrorCodes.USER_INVALID_EMAIL_FORMAT, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.USER_HAS_DEPENDENCIES))
                messages.Add(new() { Code = ErrorCodes.USER_HAS_DEPENDENCIES, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Product-specific errors
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_NAME_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_NAME_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_INVALID_CATEGORY))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_INVALID_CATEGORY, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_INVALID_PROVIDER))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_INVALID_PROVIDER, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_INVALID_PRICE))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_INVALID_PRICE, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PRODUCT_INVALID_QUANTITY))
                messages.Add(new() { Code = ErrorCodes.PRODUCT_INVALID_QUANTITY, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Order-specific errors
            if (!currentExistingCodes.Contains(ErrorCodes.ORDER_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.ORDER_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.ORDER_EMPTY_CART))
                messages.Add(new() { Code = ErrorCodes.ORDER_EMPTY_CART, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.ORDER_INVALID_ADDRESS))
                messages.Add(new() { Code = ErrorCodes.ORDER_INVALID_ADDRESS, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.ORDER_PAYMENT_FAILED))
                messages.Add(new() { Code = ErrorCodes.ORDER_PAYMENT_FAILED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Authorization errors
            if (!currentExistingCodes.Contains(ErrorCodes.AUTH_UNAUTHORIZED))
                messages.Add(new() { Code = ErrorCodes.AUTH_UNAUTHORIZED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.AUTH_FORBIDDEN))
                messages.Add(new() { Code = ErrorCodes.AUTH_FORBIDDEN, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.AUTH_INVALID_TOKEN))
                messages.Add(new() { Code = ErrorCodes.AUTH_INVALID_TOKEN, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.AUTH_TOKEN_EXPIRED))
                messages.Add(new() { Code = ErrorCodes.AUTH_TOKEN_EXPIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // System errors
            if (!currentExistingCodes.Contains(ErrorCodes.SYSTEM_DATABASE_ERROR))
                messages.Add(new() { Code = ErrorCodes.SYSTEM_DATABASE_ERROR, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.SYSTEM_EXTERNAL_SERVICE_ERROR))
                messages.Add(new() { Code = ErrorCodes.SYSTEM_EXTERNAL_SERVICE_ERROR, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.SYSTEM_TIMEOUT))
                messages.Add(new() { Code = ErrorCodes.SYSTEM_TIMEOUT, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.SYSTEM_UNKNOWN_ERROR))
                messages.Add(new() { Code = ErrorCodes.SYSTEM_UNKNOWN_ERROR, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Pagination errors
            if (!currentExistingCodes.Contains(ErrorCodes.PAGINATION_INVALID_PAGE))
                messages.Add(new() { Code = ErrorCodes.PAGINATION_INVALID_PAGE, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.PAGINATION_INVALID_PAGE_SIZE))
                messages.Add(new() { Code = ErrorCodes.PAGINATION_INVALID_PAGE_SIZE, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Location errors
            if (!currentExistingCodes.Contains(ErrorCodes.LOCATION_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.LOCATION_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LOCATION_COORDINATES_INVALID))
                messages.Add(new() { Code = ErrorCodes.LOCATION_COORDINATES_INVALID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Message errors
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_CODE_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_CODE_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_CODE_EXISTS))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_CODE_EXISTS, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_INVALID_LANGUAGE))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_INVALID_LANGUAGE, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.MESSAGE_TEXT_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.MESSAGE_TEXT_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            // Language errors
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_INVALID_ID))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_INVALID_ID, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_NAME_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_NAME_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_CODE_REQUIRED))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_CODE_REQUIRED, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_CODE_EXISTS))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_CODE_EXISTS, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_NOT_FOUND))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_NOT_FOUND, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_NAME_EXISTS))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_NAME_EXISTS, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            if (!currentExistingCodes.Contains(ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT))
                messages.Add(new() { Code = ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });

            foreach (var message in messages)
            {
                var result = await _unitOfWork.Repository<Message>().AddAsync(message, cancellationToken);
                if (result.IsFailure)
                {
                    return Result.Failure($"Failed to add message {message.Code}: {result.Error?.Code}");
                }
            }

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
            {
                return Result.Failure($"Failed to save messages: {saveResult.Error?.Code}");
            }

            _logger.LogInformation("Successfully seeded {Count} messages", messages.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error seeding messages: {ex.Message}");
        }
    }

    private async Task<Result> SeedMessageLocalizationsAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Check if localizations already exist
            var existingLocalizations = await _unitOfWork.Repository<MessageLocalized>().GetAllAsync(cancellationToken);
            if (existingLocalizations.IsSuccess && existingLocalizations.Value.Any())
            {
                _logger.LogInformation("Message localizations already exist, skipping localization seeding");
                return Result.Success();
            }

            // Get all messages and languages
            var messagesResult = await _unitOfWork.Repository<Message>().GetAllAsync(cancellationToken);
            var languagesResult = await _unitOfWork.Languages.GetAllAsync(cancellationToken);

            if (messagesResult.IsFailure || languagesResult.IsFailure)
            {
                return Result.Failure("Failed to retrieve messages or languages for localization");
            }

            var messages = messagesResult.Value.ToList();
            var languages = languagesResult.Value.ToList();

            if (!messages.Any() || !languages.Any())
            {
                return Result.Failure("No messages or languages found for localization");
            }

            var localizations = new List<MessageLocalized>();

            // English (Language ID = 1) and Spanish (Language ID = 2) localizations
            var errorMessages = new Dictionary<string, (string English, string Spanish)>
            {
                // General validation errors
                { ErrorCodes.VALIDATION_REQUIRED_FIELD, ("This field is required", "Este campo es requerido") },
                { ErrorCodes.VALIDATION_INVALID_FORMAT, ("Invalid format", "Formato inválido") },
                { ErrorCodes.VALIDATION_OUT_OF_RANGE, ("Value is out of range", "El valor está fuera de rango") },
                { ErrorCodes.VALIDATION_INVALID_LENGTH, ("Invalid length", "Longitud inválida") },

                // Entity not found errors
                { ErrorCodes.ENTITY_NOT_FOUND, ("Entity not found", "Entidad no encontrada") },
                { ErrorCodes.USER_NOT_FOUND, ("User not found", "Usuario no encontrado") },
                { ErrorCodes.PRODUCT_NOT_FOUND, ("Product not found", "Producto no encontrado") },
                { ErrorCodes.CATEGORY_NOT_FOUND, ("Category not found", "Categoría no encontrada") },
                { ErrorCodes.PROVIDER_NOT_FOUND, ("Provider not found", "Proveedor no encontrado") },
                { ErrorCodes.ORDER_NOT_FOUND, ("Order not found", "Pedido no encontrado") },
                { ErrorCodes.LOCATION_NOT_FOUND, ("Location not found", "Ubicación no encontrada") },

                // Business logic errors
                { ErrorCodes.BUSINESS_INSUFFICIENT_QUANTITY, ("Insufficient quantity available", "Cantidad insuficiente disponible") },
                { ErrorCodes.BUSINESS_PRODUCT_OUT_OF_STOCK, ("Product is out of stock", "Producto agotado") },
                { ErrorCodes.BUSINESS_INVALID_OPERATION, ("Invalid operation", "Operación inválida") },
                { ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION, ("Business constraint violation", "Violación de restricción de negocio") },
                { ErrorCodes.BUSINESS_DUPLICATE_ENTRY, ("Duplicate entry", "Entrada duplicada") },

                // User-specific errors
                { ErrorCodes.USER_INVALID_ID, ("Invalid user ID", "ID de usuario inválido") },
                { ErrorCodes.USER_EMAIL_REQUIRED, ("Email is required", "El email es requerido") },
                { ErrorCodes.USER_PASSWORD_REQUIRED, ("Password is required", "La contraseña es requerida") },
                { ErrorCodes.USER_EMAIL_EXISTS, ("Email already exists", "El email ya existe") },
                { ErrorCodes.USER_INVALID_EMAIL_FORMAT, ("Invalid email format", "Formato de email inválido") },
                { ErrorCodes.USER_HAS_DEPENDENCIES, ("User has dependencies and cannot be deleted", "El usuario tiene dependencias y no puede ser eliminado") },

                // Product-specific errors
                { ErrorCodes.PRODUCT_INVALID_ID, ("Invalid product ID", "ID de producto inválido") },
                { ErrorCodes.PRODUCT_NAME_REQUIRED, ("Product name is required", "El nombre del producto es requerido") },
                { ErrorCodes.PRODUCT_INVALID_CATEGORY, ("Invalid category", "Categoría inválida") },
                { ErrorCodes.PRODUCT_INVALID_PROVIDER, ("Invalid provider", "Proveedor inválido") },
                { ErrorCodes.PRODUCT_INVALID_PRICE, ("Invalid price", "Precio inválido") },
                { ErrorCodes.PRODUCT_INVALID_QUANTITY, ("Invalid quantity", "Cantidad inválida") },

                // Order-specific errors
                { ErrorCodes.ORDER_INVALID_ID, ("Invalid order ID", "ID de pedido inválido") },
                { ErrorCodes.ORDER_EMPTY_CART, ("Cart is empty", "El carrito está vacío") },
                { ErrorCodes.ORDER_INVALID_ADDRESS, ("Invalid address", "Dirección inválida") },
                { ErrorCodes.ORDER_PAYMENT_FAILED, ("Payment failed", "El pago falló") },

                // Authorization errors
                { ErrorCodes.AUTH_UNAUTHORIZED, ("Unauthorized access", "Acceso no autorizado") },
                { ErrorCodes.AUTH_FORBIDDEN, ("Access forbidden", "Acceso prohibido") },
                { ErrorCodes.AUTH_INVALID_TOKEN, ("Invalid token", "Token inválido") },
                { ErrorCodes.AUTH_TOKEN_EXPIRED, ("Token has expired", "El token ha expirado") },

                // System errors
                { ErrorCodes.SYSTEM_DATABASE_ERROR, ("Database error", "Error de base de datos") },
                { ErrorCodes.SYSTEM_EXTERNAL_SERVICE_ERROR, ("External service error", "Error de servicio externo") },
                { ErrorCodes.SYSTEM_TIMEOUT, ("Operation timeout", "Tiempo de espera agotado") },
                { ErrorCodes.SYSTEM_UNKNOWN_ERROR, ("Unknown error", "Error desconocido") },

                // Pagination errors
                { ErrorCodes.PAGINATION_INVALID_PAGE, ("Invalid page number", "Número de página inválido") },
                { ErrorCodes.PAGINATION_INVALID_PAGE_SIZE, ("Invalid page size", "Tamaño de página inválido") },

                // Location errors
                { ErrorCodes.LOCATION_INVALID_ID, ("Invalid location ID", "ID de ubicación inválido") },
                { ErrorCodes.LOCATION_COORDINATES_INVALID, ("Invalid coordinates", "Coordenadas inválidas") },

                // Message errors
                { ErrorCodes.MESSAGE_INVALID_ID, ("Invalid message ID", "ID de mensaje inválido") },
                { ErrorCodes.MESSAGE_CODE_REQUIRED, ("Message code is required", "El código de mensaje es requerido") },
                { ErrorCodes.MESSAGE_CODE_EXISTS, ("Message code already exists", "El código de mensaje ya existe") },
                { ErrorCodes.MESSAGE_NOT_FOUND, ("Message not found", "Mensaje no encontrado") },
                { ErrorCodes.MESSAGE_INVALID_LANGUAGE, ("Invalid language", "Idioma inválido") },
                { ErrorCodes.MESSAGE_TEXT_REQUIRED, ("Message text is required", "El texto del mensaje es requerido") },

                // Language errors
                { ErrorCodes.LANGUAGE_INVALID_ID, ("Invalid language ID", "ID de idioma inválido") },
                { ErrorCodes.LANGUAGE_NAME_REQUIRED, ("Language name is required", "El nombre del idioma es requerido") },
                { ErrorCodes.LANGUAGE_CODE_REQUIRED, ("Language code is required", "El código de idioma es requerido") },
                { ErrorCodes.LANGUAGE_CODE_EXISTS, ("Language code already exists", "El código de idioma ya existe") },
                { ErrorCodes.LANGUAGE_NOT_FOUND, ("Language not found", "Idioma no encontrado") },
                { ErrorCodes.LANGUAGE_NAME_EXISTS, ("Language name already exists", "El nombre del idioma ya existe") },
                { ErrorCodes.LANGUAGE_INVALID_CODE_FORMAT, ("Invalid language code format", "Formato de código de idioma inválido") }
            };

            // Create mapping of error codes to message IDs
            var messageIdMapping = new Dictionary<string, int>();
            foreach (var message in messages)
            {
                messageIdMapping[message.Code] = message.Id;
            }

            // Add English localizations (Language ID = 1)
            var englishLanguage = languages.FirstOrDefault(l => l.Code == "en");
            if (englishLanguage != null)
            {
                foreach (var (errorCode, (englishText, _)) in errorMessages)
                {
                    if (messageIdMapping.TryGetValue(errorCode, out var messageId))
                    {
                        localizations.Add(new MessageLocalized
                        {
                            MessageId = messageId,
                            LanguageId = englishLanguage.Id,
                            LocalizedText = englishText,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            // Add Spanish localizations (Language ID = 2)
            var spanishLanguage = languages.FirstOrDefault(l => l.Code == "es");
            if (spanishLanguage != null)
            {
                foreach (var (errorCode, (_, spanishText)) in errorMessages)
                {
                    if (messageIdMapping.TryGetValue(errorCode, out var messageId))
                    {
                        localizations.Add(new MessageLocalized
                        {
                            MessageId = messageId,
                            LanguageId = spanishLanguage.Id,
                            LocalizedText = spanishText,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            foreach (var localization in localizations)
            {
                var result = await _unitOfWork.Repository<MessageLocalized>().AddAsync(localization, cancellationToken);
                if (result.IsFailure)
                {
                    return Result.Failure($"Failed to add localization for message {localization.MessageId}: {result.Error?.Code}");
                }
            }

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
            {
                return Result.Failure($"Failed to save localizations: {saveResult.Error?.Code}");
            }

            _logger.LogInformation("Successfully seeded {Count} message localizations", localizations.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error seeding message localizations: {ex.Message}");
        }
    }
} 