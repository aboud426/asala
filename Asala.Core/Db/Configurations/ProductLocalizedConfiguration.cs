using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductLocalizedConfiguration : IEntityTypeConfiguration<ProductLocalized>
{
    public void Configure(EntityTypeBuilder<ProductLocalized> builder)
    {
        builder.ToTable("Product_Localized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductId).IsRequired();

        builder.Property(x => x.LanguageId).IsRequired();

        builder.Property(x => x.NameLocalized).IsRequired().HasMaxLength(10);

        builder.Property(x => x.DescriptionLocalized).HasMaxLength(500).IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasOne(e => e.Language).WithMany().HasForeignKey(e => e.LanguageId);
        // Composite unique constraint for ProductId + LanguageId
        builder.HasIndex(x => new { x.ProductId, x.LanguageId }).IsUnique();
    }
}
