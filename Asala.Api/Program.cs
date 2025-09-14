using System.Reflection;
using System.Text;
using Asala.Core.Common.Extensions;
using Asala.Core.Common.Jwt;
using Asala.UseCases;
using Asala.UseCases.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataAccess(builder.Configuration);
builder.Services.AddUseCases(builder.Configuration);
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<AssemblyReference>());

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAdmin",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<JwtService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null)
{
    throw new InvalidOperationException("JwtSettings configuration is missing or invalid.");
}
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    });

// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo
//     {
//         Title = "Asala API",
//         Version = "v1",
//         Description = "A comprehensive API for managing users, customers, providers, and employees with OTP-based authentication",
//         Contact = new OpenApiContact
//         {
//             Name = "Asala Development Team",
//             Email = "support@asala.com"
//         }
//     });

//     // Set the comments path for the Swagger JSON and UI
//     var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
//     var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
//     c.IncludeXmlComments(xmlPath);

//     // Include XML comments from the Core project as well (for DTOs)
//     var coreXmlFile = "Asala.Core.xml";
//     var coreXmlPath = Path.Combine(AppContext.BaseDirectory, coreXmlFile);
//     if (File.Exists(coreXmlPath))
//         c.IncludeXmlComments(coreXmlPath);

//     // Add security definition for future JWT implementation
//     c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//     {
//         Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
//         Name = "Authorization",
//         In = ParameterLocation.Header,
//         Type = SecuritySchemeType.ApiKey,
//         Scheme = "Bearer"
//     });
// });

// Add NSwag services
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "AsalaAPI";
    config.Title = "Asala API Documentation";
    config.Version = "v1";
    config.Description = "API documentation for the Asala application";
});

var app = builder.Build();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    // Seed MessageCodes
    try
    {
        logger.LogInformation("Seeding MessageCodes...");
        var messageCodesSeeder =
            scope.ServiceProvider.GetRequiredService<Asala.UseCases.Messages.MessageCodesSeederService>();
        await messageCodesSeeder.SeedMessageCodesAsync();
        logger.LogInformation("MessageCodes seeding completed");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error occurred while seeding MessageCodes");
    }

    // Seed Admin Employee
    try
    {
        logger.LogInformation("Seeding Admin Employee...");
        var adminSeeder =
            scope.ServiceProvider.GetRequiredService<Asala.UseCases.Users.AdminEmployeeSeederService>();
        await adminSeeder.SeedAdminEmployeeAsync();
        logger.LogInformation("Admin Employee seeding completed");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error occurred while seeding Admin Employee");
    }
}

// Use NSwag middleware
app.UseOpenApi();
app.UseSwaggerUi(config =>
{
    config.DocumentTitle = "Asala API";
    config.Path = "/swagger";
    config.DocumentPath = "/swagger/{documentName}/swagger.json";
    app.UseReDoc(options =>
    {
        options.Path = "/redoc";
    });
});

app.UseHttpsRedirection();

app.UseStaticFiles();

// Use CORS
app.UseCors("AllowAdmin");

app.UseAuthorization();

app.MapControllers();

app.Run();
