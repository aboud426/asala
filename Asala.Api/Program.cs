using Asala.Core.Common.Extensions;
using Asala.UseCases.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataAccess(builder.Configuration);
builder.Services.AddUseCases(builder.Configuration);

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

// Add NSwag services
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "AsalaAPI";
    config.Title = "Asala API Documentation";
    config.Version = "v1";
    config.Description = "API documentation for the Asala application";
});

var app = builder.Build();

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
