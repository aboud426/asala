using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CategoryLocalizedConfiguration : IEntityTypeConfiguration<CategoryLocalized>
{
    public void Configure(EntityTypeBuilder<CategoryLocalized> builder)
    {
        builder.ToTable("Category_Localized");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CategoryId)
            .IsRequired();
            
        builder.Property(x => x.LocalizedName)
            .IsRequired()
            .HasMaxLength(50);
            
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
