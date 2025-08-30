using Asala.Core.Common.Extensions;
using Asala.Core.Db;
using Asala.UseCases.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataAccess(builder.Configuration);
builder.Services.AddUseCases(builder.Configuration);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAdmin", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseStaticFiles();

// Use CORS
app.UseCors("AllowAdmin");

app.UseAuthorization();

app.MapControllers();

app.Run();
