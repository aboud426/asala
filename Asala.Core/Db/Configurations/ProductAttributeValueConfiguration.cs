using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
    {
        builder.ToTable("ProductAttributeValue");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductAttributeId).IsRequired();
        builder.Property(x => x.Value).IsRequired().HasMaxLength(200);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Relationships
        builder
            .HasOne(e => e.ProductAttribute)
            .WithMany(e => e.ProductAttributeValues)
            .HasForeignKey(e => e.ProductAttributeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.ProductAttributeValueLocalizeds)
            .WithOne(e => e.ProductAttributeValue)
            .HasForeignKey(e => e.ProductAttributeValueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.ProductAttributeAssignments)
            .WithOne(e => e.ProductAttributeValue)
            .HasForeignKey(e => e.ProductAttributeValueId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.ProductAttributeId);
        builder.HasIndex(x => x.Value);
        builder.HasIndex(e => new { e.ProductAttributeId, e.Value }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
