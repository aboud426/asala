using Asala.Core.Db.Configurations;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Messages.Models;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Media.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Db;

public class AsalaDbContext : DbContext
{
    public AsalaDbContext(DbContextOptions<AsalaDbContext> options)
        : base(options) { }

    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageLocalized> MessageLocalizations => Set<MessageLocalized>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CategoryLocalized> CategoryLocalizeds => Set<CategoryLocalized>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<ProductCategoryLocalized> ProductCategoryLocalizeds => Set<ProductCategoryLocalized>();
    public DbSet<ProviderCategory> ProviderCategories => Set<ProviderCategory>();
    
    // Posts module
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLocalized> PostLocalizeds => Set<PostLocalized>();
    public DbSet<PostMedia> PostMedias => Set<PostMedia>();
    
    // Products module
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductLocalized> ProductLocalizeds => Set<ProductLocalized>();
    public DbSet<ProductMedia> ProductMedias => Set<ProductMedia>();
    public DbSet<ProductsPost> ProductsPosts => Set<ProductsPost>();
    
    // Media module
    public DbSet<Media> Medias => Set<Media>();
    public DbSet<MediaType> MediaTypes => Set<MediaType>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BaseEntityConfiguration).Assembly);
    }
}
