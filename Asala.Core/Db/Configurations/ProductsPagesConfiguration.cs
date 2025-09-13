using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductsPagesConfiguration : IEntityTypeConfiguration<ProductsPages>
{
    public void Configure(EntityTypeBuilder<ProductsPages> builder)
    {
        builder.ToTable("ProductsPages");

        builder.HasKey(x => x.Id);

        // Relationships
        builder
            .HasMany(x => x.IncludedProductTypes)
            .WithOne(x => x.ProductsPages)
            .HasForeignKey(x => x.ProductsPagesId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductsPagesLocalizedConfiguration : IEntityTypeConfiguration<ProductsPagesLocalized>
{
    public void Configure(EntityTypeBuilder<ProductsPagesLocalized> builder)
    {
        builder.ToTable("ProductsPagesLocalized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductsPagesId).IsRequired();

        builder.Property(x => x.LanguageId).IsRequired();

        builder.Property(x => x.NameLocalized).IsRequired().HasMaxLength(100);

        builder.Property(x => x.DescriptionLocalized).IsRequired().HasMaxLength(500);

        // Relationships
        builder
            .HasOne(x => x.ProductsPages)
            .WithMany(x => x.Localizations)
            .HasForeignKey(x => x.ProductsPagesId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
