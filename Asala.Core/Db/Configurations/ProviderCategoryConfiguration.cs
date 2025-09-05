using Asala.Core.Modules.Categories.Models;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProviderCategoryConfiguration : IEntityTypeConfiguration<ProviderCategory>
{
    public void Configure(EntityTypeBuilder<ProviderCategory> builder)
    {
        builder.ToTable("ProviderCategory");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CategoryId)
            .IsRequired();
            
        builder.Property(x => x.ProviderId)
            .IsRequired();
            
        // Foreign key relationships (shadow navigation properties)
        builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne<Provider>()
            .WithMany()
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.ProviderId);
            
        // Composite unique constraint for ProviderId + CategoryId
        builder.HasIndex(x => new { x.ProviderId, x.CategoryId })
            .IsUnique();
    }
}
