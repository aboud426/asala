using Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructure(builder.Configuration);

// Add caching
builder.Services.AddMemoryCache();

// Add business services
builder.Services.AddScoped<Business.Services.IUserService, Business.Services.UserService>();
builder.Services.AddScoped<Business.Services.IProductService, Business.Services.ProductService>();
builder.Services.AddScoped<Business.Services.IMessageService, Business.Services.MessageService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
