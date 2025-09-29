using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductAttributeLocalizedConfiguration : IEntityTypeConfiguration<ProductAttributeLocalized>
{
    public void Configure(EntityTypeBuilder<ProductAttributeLocalized> builder)
    {
        builder.ToTable("ProductAttributeLocalized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductAttributeId).IsRequired();
        builder.Property(x => x.LanguageId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Relationships
        builder
            .HasOne(e => e.ProductAttribute)
            .WithMany(e => e.ProductAttributeLocalizeds)
            .HasForeignKey(e => e.ProductAttributeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.ProductAttributeId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasIndex(e => new { e.ProductAttributeId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
