using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductAttributeValueLocalizedConfiguration : IEntityTypeConfiguration<ProductAttributeValueLocalized>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValueLocalized> builder)
    {
        builder.ToTable("ProductAttributeValueLocalized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductAttributeValueId).IsRequired();
        builder.Property(x => x.LanguageId).IsRequired();
        builder.Property(x => x.Value).IsRequired().HasMaxLength(200);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Relationships
        builder
            .HasOne(e => e.ProductAttributeValue)
            .WithMany(e => e.ProductAttributeValueLocalizeds)
            .HasForeignKey(e => e.ProductAttributeValueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.ProductAttributeValueId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasIndex(e => new { e.ProductAttributeValueId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
