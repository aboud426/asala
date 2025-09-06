using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Product");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.Property(x => x.CategoryId).IsRequired();

        builder.Property(x => x.ProviderId).IsRequired();

        builder.Property(x => x.Price).IsRequired().HasColumnType("decimal(10, 2)");

        builder.Property(x => x.Quantity).IsRequired();

        builder.Property(x => x.Description).HasMaxLength(500).IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.ProviderId);
        builder.HasIndex(x => x.Name);

        builder
            .HasOne(e => e.ProductCategory)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasMany(e => e.ProductLocalizeds)
            .WithOne(e => e.Product)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasMany(e => e.ProductMedias)
            .WithOne(e => e.Product)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
