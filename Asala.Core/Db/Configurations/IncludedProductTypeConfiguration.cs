using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class IncludedProductTypeConfiguration : IEntityTypeConfiguration<IncludedProductType>
{
    public void Configure(EntityTypeBuilder<IncludedProductType> builder)
    {
        builder.ToTable("IncludedProductType");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductsPagesId).IsRequired();

        builder.Property(x => x.ProductCategoryId).IsRequired();

        // Relationships
        builder
            .HasOne(x => x.ProductsPages)
            .WithMany(x => x.IncludedProductTypes)
            .HasForeignKey(x => x.ProductsPagesId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(x => x.ProductCategory)
            .WithMany()
            .HasForeignKey(x => x.ProductCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.ProductsPagesId);
        builder.HasIndex(x => x.ProductCategoryId);
        builder.HasIndex(x => new { x.ProductsPagesId, x.ProductCategoryId }).IsUnique();
    }
}
