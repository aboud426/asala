using Asala.Core.Db.Configurations;
using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.ClientPages.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Locations.Models;
using Asala.Core.Modules.Messages.Models;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Shopping.Models;
using Asala.Core.Modules.Users.Models;
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
    public DbSet<ProductCategoryLocalized> ProductCategoryLocalizeds =>
        Set<ProductCategoryLocalized>();
    public DbSet<ProviderCategory> ProviderCategories => Set<ProviderCategory>();

    // Posts module
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLocalized> PostLocalizeds => Set<PostLocalized>();
    public DbSet<PostMedia> PostMedias => Set<PostMedia>();
    public DbSet<PostType> PostTypes => Set<PostType>();
    public DbSet<PostTypeLocalized> PostTypeLocalizeds => Set<PostTypeLocalized>();

    // Base Posts
    public DbSet<BasePost> BasePosts => Set<BasePost>();
    public DbSet<BasePostLocalized> BasePostLocalizations => Set<BasePostLocalized>();
    public DbSet<BasePostMedia> BasePostMedias => Set<BasePostMedia>();
    public DbSet<PostComment> PostComments => Set<PostComment>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Reel> Reels => Set<Reel>();

    // Products module
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductLocalized> ProductLocalizeds => Set<ProductLocalized>();
    public DbSet<ProductMedia> ProductMedias => Set<ProductMedia>();
    public DbSet<ProductsPost> ProductsPosts => Set<ProductsPost>();

    // Users module
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RoleLocalized> RoleLocalizations => Set<RoleLocalized>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<PermissionLocalized> PermissionLocalizations => Set<PermissionLocalized>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<ProviderLocalized> ProviderLocalizeds => Set<ProviderLocalized>();
    public DbSet<ProviderMedia> ProviderMedias => Set<ProviderMedia>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<CurrencyLocalized> CurrencyLocalizations => Set<CurrencyLocalized>();
    public DbSet<Otp> Otps => Set<Otp>();

    // Locations module
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<LocationLocalized> LocationLocalizeds => Set<LocationLocalized>();
    public DbSet<LocalizedRegion> LocalizedRegions => Set<LocalizedRegion>();

    // Shopping module
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderActivity> OrderActivities => Set<OrderActivity>();
    public DbSet<OrderItemActivity> OrderItemActivities => Set<OrderItemActivity>();

    // Client Pages module
    public DbSet<PostsPages> PostsPages => Set<PostsPages>();
    public DbSet<PostsPagesLocalized> PostsPagesLocalizations => Set<PostsPagesLocalized>();
    public DbSet<IncludedPostType> IncludedPostTypes => Set<IncludedPostType>();
    public DbSet<ProductsPages> ProductsPages => Set<ProductsPages>();
    public DbSet<ProductsPagesLocalized> ProductsPagesLocalizations =>
        Set<ProductsPagesLocalized>();
    public DbSet<IncludedProductType> IncludedProductTypes => Set<IncludedProductType>();

    // Users module
    public DbSet<UserOtps> UserOtps => Set<UserOtps>();
    public DbSet<UserFailedLoginAttempts> UserFailedLoginAttempts => Set<UserFailedLoginAttempts>();
    public DbSet<UserTokens> UserTokens => Set<UserTokens>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BaseEntityConfiguration).Assembly);
    }
}
