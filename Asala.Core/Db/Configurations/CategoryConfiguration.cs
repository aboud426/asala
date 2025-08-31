using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Category");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(x => x.ParentId)
            .IsRequired(false);
    }
}
