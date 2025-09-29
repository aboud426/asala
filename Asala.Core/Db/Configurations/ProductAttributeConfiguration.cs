using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("ProductAttribute");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Relationships
        builder
            .HasMany(e => e.ProductAttributeLocalizeds)
            .WithOne(e => e.ProductAttribute)
            .HasForeignKey(e => e.ProductAttributeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.ProductAttributeValues)
            .WithOne(e => e.ProductAttribute)
            .HasForeignKey(e => e.ProductAttributeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.Name);
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
