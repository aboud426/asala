using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductAttributeAssignmentConfiguration : IEntityTypeConfiguration<ProductAttributeAssignment>
{
    public void Configure(EntityTypeBuilder<ProductAttributeAssignment> builder)
    {
        builder.ToTable("ProductAttributeAssignment");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductId).IsRequired();
        builder.Property(x => x.ProductAttributeValueId).IsRequired();

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();
        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Relationships
        builder
            .HasOne(e => e.Product)
            .WithMany(e => e.ProductAttributeAssignments)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.ProductAttributeValue)
            .WithMany(e => e.ProductAttributeAssignments)
            .HasForeignKey(e => e.ProductAttributeValueId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.ProductAttributeValueId);
        builder.HasIndex(e => new { e.ProductId, e.ProductAttributeValueId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
