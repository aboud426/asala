using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Models;

public partial class TourTradeDbContext : DbContext
{
    public TourTradeDbContext()
    {
    }

    public TourTradeDbContext(DbContextOptions<TourTradeDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<CategoryLocalized> CategoryLocalizeds { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<Favorite> Favorites { get; set; }

    public virtual DbSet<Follower> Followers { get; set; }

    public virtual DbSet<Language> Languages { get; set; }

    public virtual DbSet<LocalizedRegion> LocalizedRegions { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<LocationLocalized> LocationLocalizeds { get; set; }

    public virtual DbSet<MediaType> MediaTypes { get; set; }

    public virtual DbSet<Medium> Media { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<MessageLocalized> MessageLocalizeds { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderActivity> OrderActivities { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<OrderItemActivity> OrderItemActivities { get; set; }

    public virtual DbSet<OrderItemStatus> OrderItemStatuses { get; set; }

    public virtual DbSet<OrderStatus> OrderStatuses { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<PostLocalized> PostLocalizeds { get; set; }

    public virtual DbSet<PostMedia> PostMedias { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductCategory> ProductCategories { get; set; }

    public virtual DbSet<ProductCategoryLocalized> ProductCategoryLocalizeds { get; set; }

    public virtual DbSet<ProductLocalized> ProductLocalizeds { get; set; }

    public virtual DbSet<ProductMedia> ProductMedias { get; set; }

    public virtual DbSet<ProductPost> ProductPosts { get; set; }

    public virtual DbSet<ProductsPost> ProductsPosts { get; set; }

    public virtual DbSet<Provider> Providers { get; set; }

    public virtual DbSet<ProviderCategory> ProviderCategories { get; set; }

    public virtual DbSet<ProviderEmployee> ProviderEmployees { get; set; }

    public virtual DbSet<Reaction> Reactions { get; set; }

    public virtual DbSet<ReactionType> ReactionTypes { get; set; }

    public virtual DbSet<Region> Regions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<Story> Stories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("Arabic_CI_AS");

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasOne(d => d.User).WithMany(p => p.Carts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cart_User");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cart_Item_Cart");

            entity.HasOne(d => d.Post).WithMany(p => p.CartItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cart_Item_Post");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cart_Item_Product");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_Category_Category");
        });

        modelBuilder.Entity<CategoryLocalized>(entity =>
        {
            entity.Property(e => e.LocalizedName).IsFixedLength();

            entity.HasOne(d => d.Category).WithMany(p => p.CategoryLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Category_Localized_Category");

            entity.HasOne(d => d.Language).WithMany(p => p.CategoryLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Category_Localized_Language");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.User).WithOne(p => p.Customer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Customer_User");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.Property(e => e.UserId).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithOne(p => p.Employee)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Employee_User");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasOne(d => d.Product).WithMany(p => p.Favorites)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favorite_Product");

            entity.HasOne(d => d.User).WithMany(p => p.Favorites)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favorite_User");
        });

        modelBuilder.Entity<Follower>(entity =>
        {
            entity.HasOne(d => d.FollowerNavigation).WithMany(p => p.FollowerFollowerNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Follower_User");

            entity.HasOne(d => d.Following).WithMany(p => p.FollowerFollowings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Follower_User1");
        });

        modelBuilder.Entity<Language>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<LocalizedRegion>(entity =>
        {
            entity.Property(e => e.LocalizedName).IsFixedLength();

            entity.HasOne(d => d.Language).WithMany(p => p.LocalizedRegions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LocalizedRegion_Language");

            entity.HasOne(d => d.Region).WithMany(p => p.LocalizedRegions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LocalizedRegion_Region");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.Region).WithMany(p => p.Locations).HasConstraintName("FK_Location_Region");
        });

        modelBuilder.Entity<LocationLocalized>(entity =>
        {
            entity.Property(e => e.LocalizedName).IsFixedLength();

            entity.HasOne(d => d.Language).WithMany(p => p.LocationLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Location_Localized_Language");

            entity.HasOne(d => d.Location).WithMany(p => p.LocationLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Location_Localized_Location");
        });

        modelBuilder.Entity<MediaType>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<Medium>(entity =>
        {
            entity.Property(e => e.Url).IsFixedLength();

            entity.HasOne(d => d.MediaType).WithMany(p => p.Media)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Media_Media_Type");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.Property(e => e.Code).IsRequired().HasMaxLength(100);

            entity.HasIndex(e => e.Code, "IX_Message_Code")
                .IsUnique();
        });

        modelBuilder.Entity<MessageLocalized>(entity =>
        {
            entity.Property(e => e.LocalizedText).IsRequired().HasMaxLength(1000);

            entity.HasOne(d => d.Language).WithMany(p => p.MessageLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MessageLocalized_Language");

            entity.HasOne(d => d.Message).WithMany(p => p.MessageLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MessageLocalized_Message");

            entity.HasIndex(e => new { e.MessageId, e.LanguageId }, "IX_MessageLocalized_MessageId_LanguageId")
                .IsUnique();
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(d => d.ShippingAddress).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Location");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_User");
        });

        modelBuilder.Entity<OrderActivity>(entity =>
        {
            entity.HasOne(d => d.Order).WithMany(p => p.OrderActivities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderActivity_Order");

            entity.HasOne(d => d.OrderStatus).WithMany(p => p.OrderActivities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderActivity_OrderStatus");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Item_Order");

            entity.HasOne(d => d.Post).WithMany(p => p.OrderItems).HasConstraintName("FK_Order_Item_Post");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Item_Product");

            entity.HasOne(d => d.Provider).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Item_Provider");
        });

        modelBuilder.Entity<OrderItemActivity>(entity =>
        {
            entity.HasOne(d => d.OrderItem).WithMany(p => p.OrderItemActivities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderItemActivity_Order_Item");

            entity.HasOne(d => d.OrderItemStatus).WithMany(p => p.OrderItemActivities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderItemActivity_OrderItemStatus");
        });

        modelBuilder.Entity<OrderItemStatus>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<OrderStatus>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();

            entity.HasOne(d => d.User).WithMany(p => p.Posts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_User");
        });

        modelBuilder.Entity<PostLocalized>(entity =>
        {
            entity.Property(e => e.DescriptionLocalized).IsFixedLength();

            entity.HasOne(d => d.Language).WithMany(p => p.PostLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Localized_Language");

            entity.HasOne(d => d.Post).WithMany(p => p.PostLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Localized_Post");
        });

        modelBuilder.Entity<PostMedia>(entity =>
        {
            entity.HasOne(d => d.Media).WithMany(p => p.PostMedia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Medias_Media");

            entity.HasOne(d => d.Post).WithMany(p => p.PostMedia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Medias_Post");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_ProductCategory");

            entity.HasOne(d => d.Provider).WithMany(p => p.Products)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Provider");
        });

        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.Property(e => e.Description).IsFixedLength();
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_ProductCategory_ProductCategory");
        });

        modelBuilder.Entity<ProductCategoryLocalized>(entity =>
        {
            entity.Property(e => e.DecriptionLocalized).IsFixedLength();
            entity.Property(e => e.NameLocalized).IsFixedLength();

            entity.HasOne(d => d.Category).WithMany(p => p.ProductCategoryLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProductCategory_Localized_ProductCategory");

            entity.HasOne(d => d.Language).WithMany(p => p.ProductCategoryLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProductCategory_Localized_Language");
        });

        modelBuilder.Entity<ProductLocalized>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.DescriptionLocalized).IsFixedLength();
            entity.Property(e => e.NameLocalized).IsFixedLength();
            entity.Property(e => e.ProductId).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Language).WithMany(p => p.ProductLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Localized_Language");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductLocalizeds)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Localized_Product");
        });

        modelBuilder.Entity<ProductMedia>(entity =>
        {
            entity.HasOne(d => d.Media).WithMany(p => p.ProductMedia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Medias_Media");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductMedia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Medias_Product");
        });

        modelBuilder.Entity<ProductPost>(entity =>
        {
            entity.HasOne(d => d.Post).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Post_Post");

            entity.HasOne(d => d.PostNavigation).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Post_Products_Post");
        });

        modelBuilder.Entity<ProductsPost>(entity =>
        {
            entity.HasOne(d => d.Product).WithMany(p => p.ProductsPosts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Products_Post_Product");
        });

        modelBuilder.Entity<Provider>(entity =>
        {
            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.BusinessName).IsFixedLength();

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_Provider_Provider");

            entity.HasOne(d => d.User).WithOne(p => p.Provider)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Provider_User");
        });

        modelBuilder.Entity<ProviderCategory>(entity =>
        {
            entity.HasOne(d => d.Category).WithMany(p => p.ProviderCategories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProviderCategories_Category");

            entity.HasOne(d => d.Provider).WithMany(p => p.ProviderCategories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProviderCategories_Provider");
        });

        modelBuilder.Entity<ProviderEmployee>(entity =>
        {
            entity.HasOne(d => d.Employee).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Provider_Employees_Employee");

            entity.HasOne(d => d.Provider).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Provider_Employees_Provider");
        });

        modelBuilder.Entity<Reaction>(entity =>
        {
            entity.HasOne(d => d.Post).WithMany(p => p.Reactions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reaction_Post");

            entity.HasOne(d => d.ReactionType).WithMany(p => p.Reactions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reaction_ReactionType");

            entity.HasOne(d => d.User).WithMany(p => p.Reactions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reaction_User");
        });

        modelBuilder.Entity<ReactionType>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<Region>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_Region_Region");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.Name).IsFixedLength();
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasOne(d => d.Permission).WithMany(p => p.RolePermissions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Role_Permissions_Permission");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Role_Permissions_Role");
        });

        modelBuilder.Entity<Story>(entity =>
        {
            entity.Property(e => e.PostId).ValueGeneratedNever();

            entity.HasOne(d => d.Post).WithOne(p => p.Story)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Story_Post");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasOne(d => d.Location).WithMany(p => p.Users).HasConstraintName("FK_User_Location");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserRoles_Role");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserRoles_User");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
