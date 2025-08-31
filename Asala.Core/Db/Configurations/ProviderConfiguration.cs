using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProviderConfiguration : IEntityTypeConfiguration<Provider>
{
    public void Configure(EntityTypeBuilder<Provider> builder)
    {
        builder.ToTable("Provider");
        
        builder.HasKey(e => e.UserId);
        
        builder.Property(e => e.BusinessName)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(e => e.Rating)
            .IsRequired();
            
        builder.Property(e => e.ParentId)
            .IsRequired(false);
            
        // Foreign Key Relationships (no navigation properties)
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne<Provider>()
            .WithMany()
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(e => e.UserId).IsUnique();
        builder.HasIndex(e => e.BusinessName);
        builder.HasIndex(e => e.ParentId);
    }
}
