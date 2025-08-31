using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRole");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.UserId)
            .IsRequired();
            
        builder.Property(e => e.RoleId)
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
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne<Role>()
            .WithMany()
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
