using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("Role_Permissions");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.RoleId)
            .IsRequired();
            
        builder.Property(e => e.PermissionId)
            .IsRequired();
            
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
            
        // Foreign Key Relationships (no navigation properties)
        builder.HasOne<Role>()
            .WithMany()
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne<Permission>()
            .WithMany()
            .HasForeignKey(e => e.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
