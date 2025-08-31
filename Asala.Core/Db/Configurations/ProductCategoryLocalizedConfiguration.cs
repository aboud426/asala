using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductCategoryLocalizedConfiguration : IEntityTypeConfiguration<ProductCategoryLocalized>
{
    public void Configure(EntityTypeBuilder<ProductCategoryLocalized> builder)
    {
        builder.ToTable("ProductCategory_Localized");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CategoryId)
            .IsRequired();
            
        builder.Property(x => x.NameLocalized)
            .HasColumnName("Name_Localized")
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(x => x.DecriptionLocalized)
            .HasColumnName("Decription_Localized")
            .IsRequired(false)
            .HasMaxLength(500);
            
        builder.Property(x => x.LanguageId)
            .IsRequired();
            
        // Foreign key relationships without navigation properties
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.LanguageId);
            
        // Composite unique constraint for CategoryId + LanguageId
        builder.HasIndex(x => new { x.CategoryId, x.LanguageId })
            .IsUnique();
    }
}
