using Asala.Core.Modules.Products.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProductMediaConfiguration : IEntityTypeConfiguration<ProductMedia>
{
    public void Configure(EntityTypeBuilder<ProductMedia> builder)
    {
        builder.ToTable("Product_Medias");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ProductId)
            .IsRequired();
            
        builder.Property(x => x.MediaId)
            .IsRequired();
            
        // Indexes
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.MediaId);
        
        // Composite unique constraint for ProductId + MediaId
        builder.HasIndex(x => new { x.ProductId, x.MediaId })
            .IsUnique();
    }
}
