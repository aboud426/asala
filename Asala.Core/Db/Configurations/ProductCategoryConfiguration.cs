using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("ProductCategory");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(x => x.ParentId)
            .IsRequired(false);
            
        // Foreign key relationship without navigation properties
        builder.HasIndex(x => x.ParentId);
    }
}
