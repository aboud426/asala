using Asala.Core.Db.Configurations;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Db;

public class AsalaDbContext : DbContext
{
    public AsalaDbContext(DbContextOptions<AsalaDbContext> options)
        : base(options) { }

    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CategoryLocalized> CategoryLocalizeds => Set<CategoryLocalized>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<ProductCategoryLocalized> ProductCategoryLocalizeds => Set<ProductCategoryLocalized>();
    public DbSet<ProviderCategory> ProviderCategories => Set<ProviderCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BaseEntityConfiguration).Assembly);
    }
}
