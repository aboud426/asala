using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductsPostConfiguration : IEntityTypeConfiguration<ProductsPost>
{
    public void Configure(EntityTypeBuilder<ProductsPost> builder)
    {
        builder.ToTable("Products_Post");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.PostId)
            .IsRequired();
            
        builder.Property(x => x.ProductId)
            .IsRequired();
            
        // Indexes
        builder.HasIndex(x => x.PostId);
        builder.HasIndex(x => x.ProductId);
        
        // Composite unique constraint for PostId + ProductId
        builder.HasIndex(x => new { x.PostId, x.ProductId })
            .IsUnique();
    }
}
