using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Role");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(10);
            
        // Base entity properties
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);
            
        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);
            
        builder.Property(e => e.CreatedAt)
            .HasColumnType("datetime")
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .HasColumnType("datetime")
            .IsRequired();
            
        builder.Property(e => e.DeletedAt)
            .HasColumnType("datetime")
            .IsRequired(false);
            
        // Indexes
        builder.HasIndex(e => e.Name).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
